def run_interview() -> dict:
    scope = input("What does the publication cover? [regional daily news]: ") or "regional daily news"
    region = input("Which region/state? [Maharashtra]: ") or "Maharashtra"
    language = input("Which language? [Marathi]: ") or "Marathi"
    audience = input("Who is the audience? [general public]: ") or "general public"
    return {"scope": scope, "region": region, "language": language, "audience": audience}
