from fastapi import APIRouter, HTTPException
from backend.utils import aws_utils
from botocore.exceptions import ClientError
from typing import Dict, Any
import logging

router = APIRouter()

# Fetch the logger instance
logger = logging.getLogger(__name__)

@router.get("/templates")
def list_templates(page: int = 1, per_page: int = 10):
    logger.info(f"Fetching SES templates - page: {page}, per_page: {per_page}")
    return aws_utils.list_ses_templates(page, per_page)

@router.get("/template/{template_name}")
def get_template(template_name: str) -> Any:
    logger.info(f"Fetching SES template with name: {template_name}")
    return aws_utils.get_ses_template(template_name)

@router.post("/template")
def create_template(template_data: Dict[str, Dict]):
    try:
        logger.info(f"Creating SES template with data: {template_data}")
        return aws_utils.create_ses_template(template_data['Template'])
    except ClientError as e:
        error_code = e.response['Error']['Code']
        logger.error(f"Error creating SES template - Code: {error_code}, Message: {e}")
        if error_code == 'AlreadyExists':
            raise HTTPException(status_code=409, detail="Template already exists.")
        elif error_code == 'InvalidTemplate':
            raise HTTPException(status_code=400, detail="Invalid template format.")
        elif error_code == 'LimitExceededException':
            raise HTTPException(status_code=429, detail="Template limit exceeded.")
        else:
            raise HTTPException(status_code=500, detail="An unexpected error occurred.")

@router.put("/template/{template_name}")
def update_template(template_name: str, template_data: Dict[str, Dict]):
    try:
        logger.info(f"Updating SES template - name: {template_name}, data: {template_data}")
        return aws_utils.update_ses_template(template_name, template_data['Template'])
    except ClientError as e:
        error_code = e.response['Error']['Code']
        logger.error(f"Error updating SES template - Code: {error_code}, Message: {e}")
        if error_code == 'TemplateDoesNotExist':
            raise HTTPException(status_code=404, detail="Template does not exist.")
        elif error_code == 'InvalidTemplate':
            raise HTTPException(status_code=400, detail="Invalid template format.")
        else:
            raise HTTPException(status_code=500, detail="An unexpected error occurred.")

@router.delete("/template/{template_name}")
def delete_template(template_name: str):
    logger.info(f"Deleting SES template with name: {template_name}")
    return aws_utils.delete_ses_template(template_name)
