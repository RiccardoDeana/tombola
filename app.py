import json
import os
import queue
import threading

from flask import Flask, Response, redirect, render_template, request, session, stream_with_context, url_for

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'dev-secret-change-me')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'tombola')

# --- Game state ---
_lock = threading.Lock()
_called: set[int] = set()
_subscribers: list[queue.Queue] = []


def _broadcast():
    """Push current state to all SSE subscribers. Must be called with _lock held."""
    data = json.dumps(sorted(_called))
    for q in _subscribers:
        try:
            q.put_nowait(data)
        except queue.Full:
            pass


# --- Auth ---
def is_admin() -> bool:
    return session.get('authenticated') is True


# --- Routes ---
@app.route('/')
def index():
    return render_template('viewer.html')


@app.route('/admin')
def admin():
    if not is_admin():
        return redirect(url_for('login'))
    return render_template('admin.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if is_admin():
        return redirect(url_for('admin'))
    error = None
    if request.method == 'POST':
        if request.form.get('password') == ADMIN_PASSWORD:
            session['authenticated'] = True
            return redirect(url_for('admin'))
        error = 'Wrong password'
    return render_template('login.html', error=error)


@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return redirect(url_for('index'))


@app.route('/call/<int:number>', methods=['POST'])
def call_number(number):
    if not is_admin():
        return '', 403
    if 1 <= number <= 90:
        with _lock:
            _called.add(number)
            _broadcast()
    return '', 204


@app.route('/uncall/<int:number>', methods=['POST'])
def uncall_number(number):
    if not is_admin():
        return '', 403
    if 1 <= number <= 90:
        with _lock:
            _called.discard(number)
            _broadcast()
    return '', 204


@app.route('/reset', methods=['POST'])
def reset():
    if not is_admin():
        return '', 403
    with _lock:
        _called.clear()
        _broadcast()
    return '', 204


@app.route('/stream')
def stream():
    def generate():
        q: queue.Queue = queue.Queue(maxsize=10)
        with _lock:
            _subscribers.append(q)
            initial = json.dumps(sorted(_called))
        try:
            yield f'data: {initial}\n\n'
            while True:
                try:
                    data = q.get(timeout=30)
                    yield f'data: {data}\n\n'
                except queue.Empty:
                    yield ': keepalive\n\n'
        finally:
            with _lock:
                if q in _subscribers:
                    _subscribers.remove(q)

    return Response(
        stream_with_context(generate()),
        content_type='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'X-Accel-Buffering': 'no',
        },
    )


@app.errorhandler(404)
def not_found(_):
    return render_template('404.html'), 404


if __name__ == '__main__':
    app.run(debug=True)
