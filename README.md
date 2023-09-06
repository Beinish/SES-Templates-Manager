# SES-Templates-Manager
A simple Web-UI to manage AWS SES templates.

## 📃 Features
- Basic templates management: edit, duplicate or delete a given template.
- Integrated Quill editor.
- Supports both Text and HTML templates by toggling between the two modes inside the editor.
- Pagination for users with lots of templates.

## ❔ Prerequistes
- Configure AWS credentials with `aws configure`
- (Optioanl) Create a new virtual environment.
- (Optional) Install Docker.

## 🧑‍🏫 How To Run
### 🐳 Docker
1. Clone the repo: `git clone git@github.com:Beinish/SES-Templates-Manager.git`
2. `cd` into the folder.
3. Build the Docker image: `docker build -t ses-template-manager .`
4. Run the image `docker run -v ~/.aws:/root/.aws -p 8000:8000 ses-template-manager`
5. Open the UI: http://localhost:8000

### 🏠 Locally
1. Clone the repo: `git clone git@github.com:Beinish/SES-Templates-Manager.git`
2. `cd` into the folder.
3. Run `pip install -r requirements.txt`
4. Run `uvicorn backend.main:app --reload`

## 🖼️ Preview

![main-gui](https://i.imgur.com/Zw8qODs.png)

![editor](https://i.imgur.com/qDI4uq8.png)

## ⛏️ Maintenance
This project is presented "as-is". It's just a hobby project that answered my needs for SES, since AWS does not provide a UI to manage templates (only possible with CLI).
If anything breaks, feel free to let me know and I'll do my best to fix it.
