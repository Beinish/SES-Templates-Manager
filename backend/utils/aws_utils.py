import boto3
import logging

logger = logging.getLogger(__name__)


def create_ses_client():
    try:
        client = boto3.client("ses")
        return client
    except Exception as e:
        logger.error(f"Failed to create SES client: {e}")
        raise


def get_total_templates_count():
    try:
        client = create_ses_client()
        count = 0
        next_token = None

        while True:
            if next_token:
                response = client.list_templates(NextToken=next_token)
            else:
                response = client.list_templates()

            count += len(response["TemplatesMetadata"])

            # If NextToken exists in the response, then there are more templates to fetch
            next_token = response.get("NextToken", None)
            if not next_token:
                break

        return count
    except Exception as e:
        logger.error(f"Failed to get total templates count: {e}")
        raise


def list_ses_templates(page, size):
    try:
        client = create_ses_client()

        # Fetch the total number of templates
        total_templates_count = get_total_templates_count()

        # Compute the total number of pages
        total_pages = (total_templates_count + size - 1) // size

        params = {"MaxItems": size}
        for _ in range(page):
            response = client.list_templates(**params)

            # Check if there is a NextToken in the response. If there is, it means there are more pages.
            if "NextToken" in response:
                params["NextToken"] = response["NextToken"]
            else:
                if _ < page - 1:
                    return []

        return {"templates": response["TemplatesMetadata"], "totalPages": total_pages}
    except Exception as e:
        logger.error(
            f"Failed to list SES templates for page {page} with size {size}: {e}"
        )
        raise


def get_ses_template(template_name):
    try:
        client = create_ses_client()
        response = client.get_template(TemplateName=template_name)
        return response["Template"]
    except Exception as e:
        logger.error(f"Failed to get SES template {template_name}: {e}")
        raise


def create_ses_template(template_data):
    try:
        client = create_ses_client()

        # Ensure HtmlPart and TextPart are not None
        template_data["HtmlPart"] = template_data.get("HtmlPart") or ""
        template_data["TextPart"] = template_data.get("TextPart") or ""

        response = client.create_template(Template=template_data)
        logger.info(f"Created SES template with name {template_data['TemplateName']}.")
        return response
    except Exception as e:
        logger.error(
            f"Failed to create SES template with name {template_data['TemplateName']}: {e}"
        )
        raise


def update_ses_template(template_name, template_data):
    try:
        client = create_ses_client()
        response = client.update_template(Template=template_data)
        logger.info(f"Updated SES template {template_name}.")
        return response
    except Exception as e:
        logger.error(f"Failed to update SES template {template_name}: {e}")
        raise


def delete_ses_template(template_name):
    try:
        client = create_ses_client()
        response = client.delete_template(TemplateName=template_name)
        logger.info(f"Deleted SES template {template_name}.")
        return response
    except Exception as e:
        logger.error(f"Failed to delete SES template {template_name}: {e}")
        raise
