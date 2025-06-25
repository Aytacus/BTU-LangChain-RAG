import os
from dotenv import load_dotenv
from langchain_community.document_loaders import DirectoryLoader, PyPDFLoader
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.docstore.document import Document
import re


def split_by_madde(text: str, pdf_name: str):
    full_text = re.sub(r'\n+', ' ', text)
    pattern = r"(MADDE\s+\d+.*?)(?=MADDE\s+\d+|$)"
    madde_blocks = re.findall(pattern, full_text, flags=re.DOTALL)

    docs = []
    for block in madde_blocks:
        header_pattern = r"MADDE\s+(\d+)\s*-\s*\((\d+|[a-zA-Z])\)"
        header_match = re.search(header_pattern, block)
        if header_match:
            main_number = header_match.group(1)
            first_alt = header_match.group(2)
            identifier = f"{main_number} ({first_alt})"
        else:
            identifier = "?"

        docs.append(
            Document(
                page_content=block.strip(),
                metadata={"source": pdf_name, "madde_number": identifier}
            )
        )
    return docs


def ingest_pdfs():
    load_dotenv()

    persist_directory = "./.chroma"
    pdf_dir = "./docs"

    if os.path.exists(persist_directory):
        print("Önceden oluşturulmuş veritabanı diskten yükleniyor...")
        embeddings = OpenAIEmbeddings()
        vectorstore = Chroma(
            persist_directory=persist_directory,
            embedding_function=embeddings,
            collection_name="mevzuat-chroma"
        )
        return vectorstore

    # yeni vektör veritabanı
    pdf_files = [f for f in os.listdir(pdf_dir) if f.endswith(".pdf")]
    all_docs = []

    for pdf_file in pdf_files:
        pdf_path = os.path.join(pdf_dir, pdf_file)
        loader = PyPDFLoader(pdf_path)
        pages = loader.load_and_split()
        full_text = "\n".join([p.page_content for p in pages])
        madde_docs = split_by_madde(full_text, pdf_file)
        all_docs.extend(madde_docs)
        # Her PDF işlendikten sonra bellek temizliği
        del pages
        del full_text

    if not all_docs:
        raise ValueError("Hiç doküman işlenmedi. PDF'lerde 'MADDE' formatında içerik bulunamadı.")

    print(f"Toplam {len(all_docs)} 'MADDE' chunk oluşturuldu.")

    # Process documents in smaller batches
    BATCH_SIZE = 50  # Daha küçük batch size
    embeddings = OpenAIEmbeddings()
    
    # Initialize Chroma with first batch
    first_batch = all_docs[:BATCH_SIZE]
    vectorstore = Chroma.from_documents(
        documents=first_batch,
        embedding=embeddings,
        collection_name="mevzuat-chroma",
        persist_directory=persist_directory
    )
    
    # Process remaining batches
    for i in range(BATCH_SIZE, len(all_docs), BATCH_SIZE):
        batch = all_docs[i:i + BATCH_SIZE]
        vectorstore.add_documents(batch)
        print(f"İşlenen batch: {i//BATCH_SIZE + 1}/{(len(all_docs) + BATCH_SIZE - 1)//BATCH_SIZE}")
        # Her batch sonrası bellek temizliği
        del batch
    
    vectorstore.persist()
    print("Vektör veritabanı oluşturuldu ve diske kaydedildi")

    return vectorstore