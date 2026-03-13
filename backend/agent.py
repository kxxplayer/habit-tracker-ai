from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
import os
from dotenv import load_dotenv

# Load environment variables from a .env file (like OPENAI_API_KEY)
load_dotenv()

# 1. Initialize the LLM
# Note: It usually does not fail until you try to use it.
llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash-latest", temperature=0.7)

# 2. Define the Prompt
coach_template = """
You are an enthusiastic and highly motivating AI Habit Coach.
Your client, {user_name}, just completed their habit: "{habit_title}".

Write a very short, punchy, 1-2 sentence congratulatory message to keep them motivated.
Do not use emojis. Be direct and encouraging.
"""

prompt = PromptTemplate(
    input_variables=["user_name", "habit_title"],
    template=coach_template
)

# 3. Create the Chain
coach_chain = prompt | llm 

def get_motivational_note(user_name: str, habit_title: str) -> str:
    """Runs the Langchain AI to generate a note."""
    try:
        # Run the chain!
        response = coach_chain.invoke({
            "user_name": user_name,
            "habit_title": habit_title
        })
        return response.content
    except Exception as e:
        print(f"AI Error: {e}")
        return "Great job! You're building an unstoppable streak. Keep it going! 💪"
