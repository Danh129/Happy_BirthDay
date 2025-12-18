from flask import Flask, render_template, request, jsonify, session
import os

# Khởi tạo ứng dụng Flask
app = Flask(__name__)
# Thiết lập khóa bí mật cho session (cần thiết để dùng session)
app.secret_key = os.urandom(24)

# >>> Mật khẩu của bạn nằm ở đây <<<
PASSWORD = "12092006"

@app.route("/", methods=["GET"])
def index():
    # Kiểm tra trạng thái mở khóa trong session
    unlocked = session.get("unlocked", False)
    return render_template("index.html", unlocked=unlocked)

@app.route("/unlock", methods=["POST"])
def unlock():
    data = request.get_json() or {}
    password = data.get("password", "")
    # So sánh mật khẩu
    if password == PASSWORD:
        session["unlocked"] = True
        return jsonify({"ok": True})
    else:
        # Trả về lỗi 401 nếu sai mật khẩu
        return jsonify({"ok": False, "error": "Mật khẩu không đúng."}), 401

@app.route("/lock", methods=["POST"])
def lock():
    # Route tùy chọn để khóa lại session
    session.pop("unlocked", None)
    return jsonify({"ok": True})

if __name__ == "__main__":
    # Chạy ứng dụng. Nó thường chạy ở 127.0.0.1
    app.run(debug=True)