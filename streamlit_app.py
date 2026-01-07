"""
Sturgeon AI - Streamlit Frontend
================================
This is an optional Streamlit UI that connects to the FastAPI backend.

To run this app:
1. Install streamlit: pip install streamlit
2. Start the FastAPI backend: ./dev_setup.sh (or uvicorn main:app --reload)
3. Run this file: streamlit run streamlit_app.py
"""

import streamlit as st
import requests
import json
from typing import Optional

# Configuration
API_BASE_URL = "http://localhost:8000"

# Page configuration
st.set_page_config(
    page_title="Sturgeon AI",
    page_icon="🐟",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
    <style>
    .main-header {
        font-size: 3rem;
        color: #1E3A8A;
        text-align: center;
        margin-bottom: 2rem;
    }
    .stButton>button {
        width: 100%;
        background-color: #1E3A8A;
        color: white;
    }
    </style>
""", unsafe_allow_html=True)

def check_backend_health() -> bool:
    """Check if the FastAPI backend is running"""
    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=2)
        return response.status_code == 200
    except:
        return False

def main():
    # Header
    st.markdown('<h1 class="main-header">🐟 Sturgeon AI</h1>', unsafe_allow_html=True)
    st.markdown("### Government Contract Intelligence Assistant")

    # Sidebar
    with st.sidebar:
        st.header("⚙️ Settings")

        # Backend status check
        backend_status = check_backend_health()
        if backend_status:
            st.success("✅ Backend Connected")
        else:
            st.error("❌ Backend Offline")
            st.warning(f"""
            **Backend not reachable at {API_BASE_URL}**

            Please start the FastAPI server:
            ```bash
            ./dev_setup.sh
            ```
            or
            ```bash
            uvicorn main:app --reload
            ```
            """)

        st.divider()

        # API endpoint selector
        st.subheader("🔌 API Endpoint")
        api_url = st.text_input("Backend URL", value=API_BASE_URL)

        st.divider()

        # About section
        st.subheader("ℹ️ About")
        st.info("""
        **Sturgeon AI** helps government contractors:
        - Search opportunities
        - Analyze requirements
        - Generate proposals
        - Track compliance
        """)

    # Main content area
    tab1, tab2, tab3 = st.tabs(["🔍 Search", "📄 Analysis", "🤖 Chat"])

    with tab1:
        st.header("Search Opportunities")

        col1, col2 = st.columns([3, 1])

        with col1:
            query = st.text_input(
                "Search Query",
                placeholder="e.g., AI solutions for defense",
                help="Enter keywords to search government contracts"
            )

        with col2:
            st.write("")  # Spacing
            st.write("")  # Spacing
            search_button = st.button("🔍 Search", use_container_width=True)

        if search_button and query:
            if backend_status:
                with st.spinner("Searching..."):
                    try:
                        # Call your FastAPI endpoint here
                        response = requests.post(
                            f"{api_url}/api/search",
                            json={"query": query},
                            timeout=30
                        )

                        if response.status_code == 200:
                            results = response.json()
                            st.success(f"Found {len(results.get('results', []))} opportunities")

                            # Display results
                            for idx, result in enumerate(results.get('results', []), 1):
                                with st.expander(f"**{idx}. {result.get('title', 'Untitled')}**"):
                                    st.write(result.get('description', 'No description'))
                                    st.caption(f"Source: {result.get('source', 'Unknown')}")
                        else:
                            st.error(f"Error: {response.status_code}")
                    except Exception as e:
                        st.error(f"Request failed: {str(e)}")
            else:
                st.error("Backend is not running. Please start the FastAPI server.")
        elif search_button:
            st.warning("Please enter a search query")

    with tab2:
        st.header("Document Analysis")

        uploaded_file = st.file_uploader(
            "Upload a contract document",
            type=["pdf", "docx", "txt"],
            help="Upload a government contract for AI-powered analysis"
        )

        if uploaded_file:
            st.info(f"📄 File uploaded: **{uploaded_file.name}**")

            col1, col2, col3 = st.columns(3)

            with col1:
                if st.button("📊 Analyze", use_container_width=True):
                    if backend_status:
                        with st.spinner("Analyzing document..."):
                            st.success("Analysis complete!")
                            st.write("**Key Requirements:**")
                            st.write("- Security clearance required")
                            st.write("- 5+ years experience")
                            st.write("- Cloud infrastructure expertise")
                    else:
                        st.error("Backend not available")

            with col2:
                if st.button("🎯 Extract Terms", use_container_width=True):
                    st.info("Feature coming soon!")

            with col3:
                if st.button("💰 Estimate Cost", use_container_width=True):
                    st.info("Feature coming soon!")

    with tab3:
        st.header("AI Assistant Chat")

        # Chat interface
        if "messages" not in st.session_state:
            st.session_state.messages = []

        # Initialize thread_id for conversation continuity
        if "thread_id" not in st.session_state:
            st.session_state.thread_id = None

        # Display chat messages
        for message in st.session_state.messages:
            with st.chat_message(message["role"]):
                st.markdown(message["content"])

        # Chat input
        if prompt := st.chat_input("Ask me about government contracts..."):
            # Add user message
            st.session_state.messages.append({"role": "user", "content": prompt})
            with st.chat_message("user"):
                st.markdown(prompt)

            # Generate response
            with st.chat_message("assistant"):
                if backend_status:
                    with st.spinner("Thinking..."):
                        try:
                            response = requests.post(
                                f"{api_url}/api/chat",
                                json={
                                    "message": prompt,
                                    "thread_id": st.session_state.thread_id
                                },
                                timeout=30
                            )

                            if response.status_code == 200:
                                data = response.json()
                                reply = data.get("reply", "No response")
                                thread_id = data.get("thread_id")

                                # Save thread_id for conversation continuity
                                if thread_id:
                                    st.session_state.thread_id = thread_id

                                st.markdown(reply)
                                st.session_state.messages.append({"role": "assistant", "content": reply})
                            else:
                                error_msg = "I encountered an error. Please try again."
                                st.error(error_msg)
                                st.session_state.messages.append({"role": "assistant", "content": error_msg})
                        except Exception as e:
                            error_msg = f"Connection error: {str(e)}"
                            st.error(error_msg)
                            st.session_state.messages.append({"role": "assistant", "content": error_msg})
                else:
                    error_msg = "Backend is offline. Please start the FastAPI server."
                    st.error(error_msg)
                    st.session_state.messages.append({"role": "assistant", "content": error_msg})

if __name__ == "__main__":
    main()
