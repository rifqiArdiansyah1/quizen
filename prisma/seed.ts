// prisma/seed.ts
import prisma from '../src/lib/prisma';

async function main() {
  const quiz = await prisma.quiz.create({
    data: {
      title: 'Kuis Pancasila',
      description: 'Kuis dasar kewarganegaraan',
      questions: {
        create: [
          {
            text: 'Apa lambang sila pertama?',
            choices: {
              create: [
                { text: 'Bintang', isCorrect: true },
                { text: 'Pohon Beringin', isCorrect: false },
                { text: 'Padi dan Kapas', isCorrect: false },
                { text: 'Rantai', isCorrect: false },
              ]
            }
          }
        ]
      }
    }
  });

  console.log('Seeded quiz:', quiz);
}
main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => prisma.$disconnect());
