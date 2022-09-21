from flask import Flask


def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'secret'

    from .views import views
    app.register_blueprint(views, url_prefix='/')

    return app


'''{% for i in range(subCnt): %}
        <tr>
            <td>{{ i + 1 }}</td>
            <td>{{ msv }}</td>
            <td>{{ name }}</td>
            <td>{{ birthdate }}</td>
            <td>{{ class_name }}</td>
            <td>{{ subjectList[i].LMH }}</td>
            <td>{{ subjectList[i].LMHName }}</td>
            <td>{{ subjectList[i].group }}</td>
            <td>{{ subjectList[i].TC }}</td>
            <td>{{ subjectList[i].note }}</td>
        </tr>
        {% endfor %}
'''
