from flask import Blueprint, render_template, redirect, url_for
from flask_login import current_user, login_required

bp = Blueprint('main', __name__)

@bp.route('/splash')
def splash():
    return render_template('splash.html')

@bp.route('/exit')
def exit_app():
    return render_template('exit.html')

@bp.route('/')
@bp.route('/index')
@login_required
def index():
    return render_template('dashboard.html', title='Home')
