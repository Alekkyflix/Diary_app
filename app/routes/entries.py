from flask import Blueprint, render_template, redirect, url_for, request
from flask_login import login_required

bp = Blueprint('entries', __name__)

@bp.route('/add', methods=['GET', 'POST'])
@login_required
def add_entry():
    return render_template('add_entry.html', title='New Entry')

@bp.route('/<int:id>')
@login_required
def entry_detail(id):
    # TODO: Fetch entry
    return render_template('entry_detail.html', title='Entry')
