import argparse
import json
from typing import Optional
from google.api_core.client_options import ClientOptions
from google.cloud import documentai  # type: ignore
import google.auth
import os

# Project configuration
project_id = "656678246625"
location = "us"
processor_id = "f02e8de4a22da6ae"
mime_type = "application/pdf"
field_mask = "text,entities,pages.pageNumber"
processor_version_id = "a4943f618dea7a81"


def process_document_sample(
        project_id: str,
        location: str,
        processor_id: str,
        file_path: str,
        mime_type: str,
        field_mask: Optional[str] = None,
        processor_version_id: Optional[str] = None,
) -> dict:
    opts = ClientOptions(api_endpoint=f"{location}-documentai.googleapis.com")
    client = documentai.DocumentProcessorServiceClient(client_options=opts)

    if processor_version_id:
        name = client.processor_version_path(
            project_id, location, processor_id, processor_version_id
        )
    else:
        name = client.processor_path(project_id, location, processor_id)

    file_path = file_path.strip('"')

    with open(file_path, "rb") as image:
        image_content = image.read()

    raw_document = documentai.RawDocument(content=image_content, mime_type=mime_type)

    process_options = documentai.ProcessOptions(
        individual_page_selector=documentai.ProcessOptions.IndividualPageSelector(
            pages=[1]
        )
    )

    request = documentai.ProcessRequest(
        name=name,
        raw_document=raw_document,
        field_mask=field_mask,
        process_options=process_options,
    )

    result = client.process_document(request=request)
    document = result.document

    output = {
        "text": document.text,
        "entities": [],
        "address": {}
    }

    for entity in document.entities:
        entity_info = {"type": entity.type_, "text": entity.mention_text}
        output["entities"].append(entity_info)
        if entity.type_ in ["Address", "Dept", "Flr", "Room", "BldgNb", "StrtNm", "TwnNm", "CtrySubDvsn", "PstCd", "Ctry", "PstBx"]:
            output["address"][entity.type_] = entity.mention_text

    return output


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Process a document using Google Document AI.')
    parser.add_argument('filepath', type=str, help='The path to the local file to be processed.')

    args = parser.parse_args()

    result = process_document_sample(
        project_id=project_id,
        location=location,
        processor_id=processor_id,
        file_path=args.filepath,
        mime_type=mime_type,
        field_mask=field_mask,
        processor_version_id=processor_version_id,
    )

    print(json.dumps(result, indent=2))
