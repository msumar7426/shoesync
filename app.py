from flask import Flask, render_template, request, jsonify
from coordinator import search_all_sites

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/search")
def search():
    query = request.args.get("q")

    if not query:
        return jsonify([])

    results = search_all_sites(query)
    return jsonify(results)

if __name__ == "__main__":
    app.run(debug=True, port=5001)