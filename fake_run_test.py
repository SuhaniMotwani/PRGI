import services.agent_service.llm_client as llm_module

llm_module.call_llm = lambda prompt, model="gemini-2.0-flash": (
    '["Konkan Sunrise Weekly Digest", "Vidarbha Morning Herald", '
    '"Sahyadri Daily Voice", "Deccan Sunrise Bulletin", "Malwa Evening Post"]'
)

from services.agent_service.workflow.run import main

if __name__ == "__main__":
    main()