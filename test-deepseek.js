import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: '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',
  baseURL: 'https://integrate.api.nvidia.com/v1',
})


async function main() {
  const completion = await openai.chat.completions.create({
    model: "deepseek-ai/deepseek-v4-pro",
    messages: [{"role":"user","content":"Hello, can you respond to this test message?"}],
    temperature: 1,
    top_p: 0.95,
    max_tokens: 16384,
    chat_template_kwargs: {"thinking":false},
    stream: true
  })

  for await (const chunk of completion) {
        process.stdout.write(chunk.choices[0]?.delta?.content || '')

  }

}

main();