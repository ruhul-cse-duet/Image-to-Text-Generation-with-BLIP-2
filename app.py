import os
import logging
from flask import Flask
from routes.main import main_bp

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def create_app():
    """Application factory pattern"""
    app = Flask(__name__)
    
    # Configuration
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
    app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), 'uploads')
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    
    # Ensure upload folder exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Register Blueprints
    app.register_blueprint(main_bp)
    
    # Error handlers
    @app.errorhandler(413)
    def too_large(e):
        return {"error": "File too large. Maximum size is 16MB."}, 413
    
    @app.errorhandler(404)
    def not_found(e):
        return {"error": "Resource not found"}, 404
    
    @app.errorhandler(500)
    def internal_error(e):
        logger.error(f"Internal server error: {str(e)}")
        return {"error": "Internal server error"}, 500
    
    logger.info("Application initialized successfully")
    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="127.0.0.1", port=5000, debug=False)
