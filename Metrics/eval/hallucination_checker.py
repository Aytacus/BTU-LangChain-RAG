from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain_openai import ChatOpenAI

class HallucinationChecker:
    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
        self.prompt = PromptTemplate(
            template="""
            Given the CONTEXT and the ANSWER below, determine whether the ANSWER is fully supported by the CONTEXT.
- The answer must be based solely on the information present in the context.
- If the answer contains information not present or implied by the context, respond 'no'.
- If the answer is accurate, complete, and supported by the context, respond 'yes'.
- If you are unsure, prefer 'no'.

CONTEXT: {context}
ANSWER: {response}

Is the answer fully supported by the context? (Respond only with 'yes' or 'no')
            """,
            input_variables=["context", "response"]
        )
        #self.chain= LLMChain(llm=self.llm, prompt=self.prompt)
        self.chain = self.prompt | self.llm

    def grade(self, context: str, response: str) -> bool:
        result = self.chain.invoke({"context": context, "response": response})
        print("SORGU CEVABI: ", result.content)
        return "yes" in result.content.lower()