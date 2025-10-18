from flask import render_template, request, jsonify, redirect, url_for, session, send_file
from werkzeug.security import generate_password_hash, check_password_hash
import csv
import io
from datetime import datetime
import os

from utility.qualityrecord import QualityRecord
from utility.user import User
from handler import db, app

def init_db():
    with app.app_context():
        db.create_all()
        if not User.query.filter_by(username='admin').first():
            admin = User(username='admin', password_hash=generate_password_hash('admin123'))
            db.session.add(admin)
            db.session.commit() 
        if QualityRecord.query.count() == 0:
            import_initial_data()

def import_initial_data():
    initial_data = [
        {"wk": "WK26", "month": "Jun", "dd": "06-26", "year": "Y2025", "date": "6/26/2025", "sn": "PYPGW", "model": "63", "test_failure_items": "IPX8", "weight_gap": "0.02", "grade": "D", "line": "2", "root_cause": "Root Cause 1", "category": "Raw Material", "risky_station": "Raw Material", "area": "10", "sampling_case": "Manual-Normal", "station_al": "", "radar_number": "15449"},

    ]
    
    for data in initial_data:
        record = QualityRecord(**data)
        db.session.add(record)
    db.session.commit()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/data')
def get_data():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 25, type=int)
    search = request.args.get('search', '')
    
    root_causes = request.args.getlist('root_cause[]')
    risky_stations = request.args.getlist('risky_station[]')
    categories = request.args.getlist('category[]')
    lines = request.args.getlist('line[]')
    models = request.args.getlist('model[]')
    weeks = request.args.getlist('wk[]')
    
    query = QualityRecord.query
    
    if search:
        query = query.filter(QualityRecord.sn.contains(search))
    
    if root_causes:
        query = query.filter(QualityRecord.root_cause.in_(root_causes))
    if risky_stations:
        query = query.filter(QualityRecord.risky_station.in_(risky_stations))
    if categories:
        query = query.filter(QualityRecord.category.in_(categories))
    if lines:
        query = query.filter(QualityRecord.line.in_(lines))
    if models:
        query = query.filter(QualityRecord.model.in_(models))
    if weeks:
        query = query.filter(QualityRecord.wk.in_(weeks))
    
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    records = [{
        'id': r.id,
        'wk': r.wk,
        'month': r.month,
        'dd': r.dd,
        'year': r.year,
        'date': r.date,
        'sn': r.sn,
        'model': r.model,
        'test_failure_items': r.test_failure_items,
        'weight_gap': r.weight_gap,
        'grade': r.grade,
        'line': r.line,
        'root_cause': r.root_cause,
        'category': r.category,
        'risky_station': r.risky_station,
        'area': r.area,
        'sampling_case': r.sampling_case,
        'station_al': r.station_al,
        'radar_number': r.radar_number
    } for r in pagination.items]
    
    return jsonify({
        'records': records,
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    })

@app.route('/api/filters')
def get_filters():
    """Get unique values for all filter fields"""
    filters = {
        'root_causes': [r[0] for r in db.session.query(QualityRecord.root_cause).distinct().all() if r[0]],
        'risky_stations': [r[0] for r in db.session.query(QualityRecord.risky_station).distinct().all() if r[0]],
        'categories': [r[0] for r in db.session.query(QualityRecord.category).distinct().all() if r[0]],
        'lines': [r[0] for r in db.session.query(QualityRecord.line).distinct().all() if r[0]],
        'models': [r[0] for r in db.session.query(QualityRecord.model).distinct().all() if r[0]],
        'weeks': [r[0] for r in db.session.query(QualityRecord.wk).distinct().all() if r[0]]
    }
    return jsonify(filters)

@app.route('/api/export')
def export_data():
    search = request.args.get('search', '')
    root_causes = request.args.getlist('root_cause[]')
    risky_stations = request.args.getlist('risky_station[]')
    categories = request.args.getlist('category[]')
    lines = request.args.getlist('line[]')
    models = request.args.getlist('model[]')
    weeks = request.args.getlist('wk[]')
    
    query = QualityRecord.query
    
    if search:
        query = query.filter(QualityRecord.sn.contains(search))
    if root_causes:
        query = query.filter(QualityRecord.root_cause.in_(root_causes))
    if risky_stations:
        query = query.filter(QualityRecord.risky_station.in_(risky_stations))
    if categories:
        query = query.filter(QualityRecord.category.in_(categories))
    if lines:
        query = query.filter(QualityRecord.line.in_(lines))
    if models:
        query = query.filter(QualityRecord.model.in_(models))
    if weeks:
        query = query.filter(QualityRecord.wk.in_(weeks))
    
    records = query.all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    writer.writerow(['WK', 'Month', 'DD', 'YEAR', 'Date', 'SN', 'Model', 'Test failure items', 
                     'Weight Gap', 'Grade', 'Line', 'Root cause and effect', 'Category', 
                     'Risky station', 'Area', 'Sampling case', 'STATION AL', 'Radar Number'])
    
    for r in records:
        writer.writerow([r.wk, r.month, r.dd, r.year, r.date, r.sn, r.model, r.test_failure_items,
                        r.weight_gap, r.grade, r.line, r.root_cause, r.category, r.risky_station,
                        r.area, r.sampling_case, r.station_al, r.radar_number])
    
    output.seek(0)
    return send_file(
        io.BytesIO(output.getvalue().encode('utf-8')),
        mimetype='text/csv',
        as_attachment=True,
        download_name=f'quality_data_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
    )

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        user = User.query.filter_by(username=username).first()
        if user and check_password_hash(user.password_hash, password):
            session['user_id'] = user.id
            session['username'] = user.username
            return redirect(url_for('admin'))
        
        return render_template('login.html', error='Invalid credentials')
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

@app.route('/admin')
def admin():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return render_template('admin.html')

@app.route('/api/admin/record', methods=['POST'])
def create_record():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.json
    record = QualityRecord(**data)
    db.session.add(record)
    db.session.commit()
    
    return jsonify({'message': 'Record created', 'id': record.id})

@app.route('/api/admin/record/<int:id>', methods=['PUT'])
def update_record(id):
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    record = QualityRecord.query.get_or_404(id)
    data = request.json
    
    for key, value in data.items():
        setattr(record, key, value)
    
    db.session.commit()
    return jsonify({'message': 'Record updated'})

@app.route('/api/admin/record/<int:id>', methods=['DELETE'])
def delete_record(id):
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    record = QualityRecord.query.get_or_404(id)
    db.session.delete(record)
    db.session.commit()
    
    return jsonify({'message': 'Record deleted'})

if __name__ == '__main__':
    init_db()
    app.run(debug=False)