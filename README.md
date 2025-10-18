# Quality_Failure_Record_Management_System

A comprehensive web application for managing and analyzing quality control data with public viewing and secure admin management capabilities.

![](assests\dashboard.jpg)

## ⚠️ **Important**: : 
- Much of code is specfically `front ends is genrated with AI.` 
- Backend and some finishing touch done by me.
- Whole project is structrued in manner easy to debug. 
- Compatible with SQLite because my need but you can modify as per your need. 

## Features

### Public Access (No Login Required)
- **Data Viewing**: Clean, sortable, and paginated data table
- **Search**: Quick search by Serial Number (SN)
- **Multi-Filter**: Filter data by:
  - Week Number (WK)
  - Model
  - Line
  - Root Cause and Effect
  - Category
  - Risky Station
- **Export**: Download filtered data as CSV
- **Responsive Design**: Works on desktop and mobile devices

### Admin Access (Login Required)
- **User Authentication**: Secure login/logout system
- **Add Records**: Create new quality records
- **Edit Records**: Modify existing records
- **Delete Records**: Remove records with confirmation
- **Full Data Management**: Complete CRUD operations

## Technology Stack

- **Backend**: Flask (Python web framework)
- **Database**: SQLite
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Authentication**: Flask sessions with password hashing

## Installation & Setup

### Prerequisites
- Python 3.7 or higher
- pip (Python package installer)

### Step 1: Install Required Packages

```bash
pip install -r requirments.txt
```

### Step 2: Project Structure

Create the following directory structure:

```
Quality_Failure_Record_Management_System/
│
├── app.py                 # Main Flask application
├── serve.py                # Run with Waitress if you want
├── README.md              
├── requirments.txt
├── License.txt
├── password_creator.py   # Run this script if you want to add user inside database. 
├── handler.py            # load the SQLalchemy and Key
├── .env                  # Needed information store
│── instance/
│       └── quality.db    # SQLite database 
│── assests/
│       └── dashboard.jpg    
│── utility/
│       └── qualityrecord.py
│       └── user.py
│── static/
│   ├──css   
│   │   └──base.css
│   │   └──index.css
│   │   └──admin.css
│   └── js/
│       └──chart.draw.js
│       └──chart.min.js   
│       └──admin.js     
└── templates/
    ├── base.html          
    ├── index.html         
    ├── login.html         
    └── admin.html         
```

### Step 3: Run the Application

```bash
python app.py
```

## Default Admin Credentials

**Username**: `admin`  
**Password**: `admin123`

⚠️ **Important**: Change these credentials in production!

## Usage Guide

### Public Dashboard (Homepage)

1. Navigate to `http://127.0.0.1:5000`
2. View all quality records in the table
3. Use the search bar to find specific Serial Numbers
4. Click filter dropdowns to select multiple criteria
5. Click "Export to CSV" to download current filtered data
6. Use pagination to navigate through records

### Admin Panel

1. Navigate to `http://127.0.0.1:5000/login`
2. Enter admin credentials
3. Access the admin panel at `http://127.0.0.1:5000/admin`

**Adding Records:**
- Click "+ Add New Record" button
- Fill in the form fields
- Click "Save Record"

**Editing Records:**
- Click "Edit" button on any record
- Modify the fields
- Click "Save Record"

**Deleting Records:**
- Click "Delete" button on any record
- Confirm the deletion

## Database Schema

The application uses a single `QualityRecord` table with the following fields:

| Field | Type | Description |
|-------|------|-------------|
| id | Integer | Primary key (auto-increment) |
| wk | String | Week number |
| month | String | Month of occurrence |
| dd | String | Day designation |
| year | String | Year |
| date | String | Full date |
| sn | String | Serial Number (indexed) |
| model | String | Product model |
| test_failure_items | String | Test failure description |
| weight_gap | String | Weight gap value |
| grade | String | Quality grade |
| line | String | Production line |
| root_cause | String | Root cause and effect |
| category | String | Failure category |
| risky_station | String | Risky station identifier |
| area | String | Production area |
| sampling_case | String | Sampling case ID |
| station_al | String | Station AL |
| radar_number | String | Radar tracking number |

## API Endpoints

### Public Endpoints (No Authentication Required)

**GET /api/data**
- Returns paginated quality records
- Parameters:
  - `page`: Page number (default: 1)
  - `per_page`: Records per page (default: 25)
  - `search`: Search by Serial Number
  - `root_cause[]`: Filter by root causes (multiple)
  - `risky_station[]`: Filter by risky stations (multiple)
  - `category[]`: Filter by categories (multiple)
  - `line[]`: Filter by lines (multiple)
  - `model[]`: Filter by models (multiple)
  - `wk[]`: Filter by weeks (multiple)

**GET /api/filters**
- Returns unique values for all filter fields
- Used to populate filter dropdowns

**GET /api/export**
- Downloads filtered data as CSV
- Accepts same filter parameters as `/api/data`

### Admin Endpoints (Authentication Required)

**POST /api/admin/record**
- Creates a new record
- Body: JSON object with record fields

**PUT /api/admin/record/<id>**
- Updates an existing record
- Body: JSON object with updated fields

**DELETE /api/admin/record/<id>**
- Deletes a record by ID

## Configuration

### Security Settings

In `.env`, update the following for production:

```python
SECRET_KEY = 'your-secret-key-change-in-production'
```

Generate a secure secret key:
```python
import secrets
secrets.token_hex(16)
```

### Database Configuration

The default database location is `sqlite:///quality.db` in the application directory.

To change the database location:
```python
SQLALCHEMY_DATABASE_URI= sqlite:////path/to/your/database.db
```

### Adding Additional Admin Users

- Use `password_creator.py` file
    ```python
        python password_creator.py
    ```
- Use Python shell:

    ```python
    from app import app, db, User
    from werkzeug.security import generate_password_hash

    with app.app_context():
        new_user = User(
            username='newadmin',
            password_hash=generate_password_hash('securepassword')
        )
        db.session.add(new_user)
        db.session.commit()
    ```

## Production Deployment

### Using Gunicorn (Recommended for Linux/Mac)

1. Install Gunicorn:
    ```bash
    pip install gunicorn
    ```

2. Run the application:
    ```bash
    gunicorn -w 4 -b 0.0.0.0:8000 app:app
    ```

### Using Waitress (Recommended for Windows)

1. Install Waitress:
    ```bash
    pip install waitress
    ```

2. Create a `serve.py` file:
    ```python
    from waitress import serve
    from app import app  


    HOST = '0.0.0.0'
    PORT = 8086

    # This line you can remove but i prefer for my own debug
    print(f"Serving Flask app '{app.name}' with Waitress on http://{HOST}:{PORT}")

    serve(app, host=HOST, port=PORT)
    ```

3. Run:
    ```bash
    python serve.py
    ```

### Environment Variables

For production, set environment variables:

```bash
export FLASK_ENV=production
export SECRET_KEY=your-generated-secret-key
```

### HTTPS/SSL

For production deployment, use a reverse proxy like Nginx or Apache with SSL certificates:

**Nginx Example Configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## Data Import

### Initial Data Import

The application automatically imports data from the sample dataset on first run. To add more data:

1. **Manual Entry**: Use the Admin Panel
2. **CSV Import**: Modify the `import_initial_data()` function
3. **Bulk Import**: Use Python shell:

```python
from app import app, db, QualityRecord

with app.app_context():
    records = [
        {
            "wk": "WK30",
            "month": "Jul",
            "sn": "ABC123",
            # ... other fields
        },
        # ... more records
    ]
    
    for data in records:
        record = QualityRecord(**data)
        db.session.add(record)
    
    db.session.commit()
```

## Backup and Restore

### Backup Database

Simply copy the SQLite database file:
```bash
cp quality.db quality_data_backup_$(date +%Y%m%d).db
```

### Restore Database

Replace the current database with a backup:
```bash
cp quality_data_backup_20250101.db quality.db
```

### Export All Data to CSV

Use the export function in the web interface, or via Python:

```python
import csv
from app import app, db, QualityRecord

with app.app_context():
    records = QualityRecord.query.all()
    
    with open('full_export.csv', 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['WK', 'Month', 'DD', 'YEAR', 'Date', 'SN', 
                        'Model', 'Test failure items', 'Weight Gap', 
                        'Grade', 'Line', 'Root cause and effect', 
                        'Category', 'Risky station', 'Area', 
                        'Sampling case', 'STATION AL', 'Radar Number'])
        
        for r in records:
            writer.writerow([r.wk, r.month, r.dd, r.year, r.date, r.sn,
                           r.model, r.test_failure_items, r.weight_gap,
                           r.grade, r.line, r.root_cause, r.category,
                           r.risky_station, r.area, r.sampling_case,
                           r.station_al, r.radar_number])
```

## Troubleshooting

### Database Locked Error

If you see "database is locked" errors:
- Close any SQLite browser tools
- Check for stale connections
- Restart the application

### Port Already in Use

Change the port in `app.py`:
```python
app.run(debug=True, port=5001)
```

### Import Errors

Ensure all dependencies are installed:
```bash
pip install -r requirements.txt
```

Create `requirements.txt`:
```
Flask==2.3.0
Flask-SQLAlchemy==3.0.5
Werkzeug==2.3.0
```

### Session Not Persisting

Check that `SECRET_KEY` is set and consistent across restarts.

## Customization

### Adding New Fields

1. Update the `QualityRecord` model in `app.py`
2. Add migration or recreate database
3. Update form in `admin.html`
4. Update display in `index.html`

### Changing Pagination Size

In `index.html` and `admin.html`, modify:
```javascript
per_page: 25  
```

### Customizing Styles

- Edit the `static\css folder files` for you cusotmer design.
- Edit the `static\js folder files` for grphs. I use publically availabe source you can use CDN version as well.

## Security Best Practices

1. **Change Default Credentials**: Immediately change the default admin password
2. **Use HTTPS**: Always use SSL/TLS in production
3. **Regular Backups**: Implement automated database backups
4. **Update Dependencies**: Keep Flask and dependencies updated
5. **Input Validation**: The application includes basic validation; enhance as needed
6. **Rate Limiting**: Consider adding rate limiting for production
7. **Session Security**: Use secure, httponly cookies in production

## Support & Maintenance

### Logging

Add logging to track issues:

```python
import logging

logging.basicConfig(
    filename='app.log',
    level=logging.INFO,
    format='%(asctime)s %(levelname)s: %(message)s'
)
```

### Monitoring

Monitor application health by checking:
- Database size and growth
- Response times
- Error rates
- Active sessions

## License

- This application is provided as-is for quality management purposes.
- MIT license, Edit reuse as per your job specfic need.

## Version History

- **v1.0.0** - Initial release with full CRUD operations, filtering, and export functionality

## Contact
- For issues or questions about deployment, consult the Flask documentation at https://flask.palletsprojects.com/
- For contact 
    - Email : shergillkuldeep@outlook.com   