import { auth } from "@/auth";
import HomeClient from "@/components/home-client";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const session = await auth();

  // 1. Fetch categories
  let categories = await prisma.forumCategory.findMany({
    orderBy: { order: "asc" },
  });

  // 2. Fetch posts
  let posts = await prisma.forumPost.findMany({
    where: { published: true },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          color: true,
        },
      },
    },
    orderBy: [
      { pinned: "desc" },
      { createdAt: "desc" },
    ],
  });

  // 3. Fetch News & App Updates
  let newsCards = await prisma.newsCard.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true } } },
  });

  let hubUpdates = await prisma.hubUpdate.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true } } },
  });

  // 4. Dynamic Seeding (if database is empty of categories/posts/news/updates)
  if (categories.length === 0 || newsCards.length === 0 || hubUpdates.length === 0) {
    // Find the first user in the database to act as the author
    let defaultUser = await prisma.user.findFirst();
    
    if (!defaultUser) {
      // If there are no users at all, create a default system user
      defaultUser = await prisma.user.create({
        data: {
          name: "JiK Oficial",
          email: "sistema@jik.com",
          role: "ADMIN",
        },
      });
    }

    if (categories.length === 0) {
      // Create default categories with their colors
      const catGeral = await prisma.forumCategory.create({
        data: {
          name: "Geral",
          slug: "geral",
          color: "#336E72",
          description: "Discussões gerais sobre fé, vida e comunidade.",
          order: 1,
        },
      });

      const catApps = await prisma.forumCategory.create({
        data: {
          name: "Aplicativos",
          slug: "aplicativos",
          color: "#9BE8D6",
          description: "Novidades, feedback e ajuda sobre os apps JiK.",
          order: 2,
        },
      });

      const catTestemunhos = await prisma.forumCategory.create({
        data: {
          name: "Testemunhos",
          slug: "testemunhos",
          color: "#E07A5F",
          description: "Compartilhe o que Deus tem feito na sua vida.",
          order: 3,
        },
      });

      const catDevocional = await prisma.forumCategory.create({
        data: {
          name: "Devocional",
          slug: "devocional",
          color: "#81B29A",
          description: "Estudos bíblicos diários e reflexões.",
          order: 4,
        },
      });

      // Create default mock posts for "bastante felicidade"
      await prisma.forumPost.createMany({
        data: [
          {
            title: "Bem-vindo ao JiK! Conheça o novo ecossistema",
            content: "Estamos muito felizes em lançar o JiK! Nosso objetivo é criar um ecossistema digital seguro, edificante e focado em conexão real. Sinta-se à vontade para compartilhar devocionais, testemunhos ou feedbacks sobre nossos próximos aplicativos. Que este seja um espaço de crescimento mútuo!",
            pinned: true,
            authorId: defaultUser.id,
            categoryId: catGeral.id,
          },
          {
            title: "Aplicativo de Devocional Diário em desenvolvimento!",
            content: "Olá irmãos! Estamos trabalhando a todo vapor no nosso primeiro aplicativo do ecossistema: um gerenciador de devocionais com planos de leitura integrados e compartilhamento de anotações com seu grupo de estudos. O que vocês gostariam de ver nele? Deixem suas ideias aqui!",
            authorId: defaultUser.id,
            categoryId: catApps.id,
          },
          {
            title: "Agradecimento: Uma semana abençoada de aprendizado",
            content: "Passando para compartilhar que esta semana consegui liderar meu primeiro pequeno grupo de oração. No começo estava muito nervoso, mas Deus capacitou cada palavra e foi um momento maravilhoso de comunhão. Se você está hesitando em dar um passo de fé, confie!",
            authorId: defaultUser.id,
            categoryId: catTestemunhos.id,
          },
        ],
      });
    }

    if (newsCards.length === 0) {
      await prisma.newsCard.createMany({
        data: [
          {
            title: "Lançamento Oficial da Comunidade JiK!",
            summary: "Seja muito bem-vindo ao ecossistema digital que une tecnologia e comunhão cristã.",
            content: "O JiK nasceu do desejo de criar um ambiente digital acolhedor para a igreja de Cristo. Aqui, você terá acesso a fóruns moderados, aplicativos para gerenciar devocionais, leitura bíblica e muito mais. Explore nossas ferramentas e conecte-se!",
            imageUrl: "https://0nxicue7ew.ufs.sh/f/BGEz3YvO4INzl57T41m0tyraZP4pYltWg12wLSuqKd7iy9I8",
            published: true,
            authorId: defaultUser.id,
          },
          {
            title: "Aplicativos JiK: Próximos passos",
            summary: "Saiba quais são os aplicativos que estão em nossa esteira de desenvolvimento.",
            content: "Nossa equipe de desenvolvedores e voluntários está focada em trazer aplicativos incríveis: Harpa Cristã, Gerenciador de Pequenos Grupos e Diário Devocional. Fique atento às nossas atualizações oficiais no Hub!",
            imageUrl: "https://0nxicue7ew.ufs.sh/f/BGEz3YvO4INzC5vVbX6K53lS97xR14ZtYh2wWfMubpEqjVdJ",
            published: true,
            authorId: defaultUser.id,
          }
        ]
      });
    }

    if (hubUpdates.length === 0) {
      await prisma.hubUpdate.createMany({
        data: [
          {
            appName: "Diário Devocional JiK",
            version: "v1.0.0",
            title: "Lançamento do Módulo de Planos de Leitura",
            description: "Adicionado suporte a mais de 10 planos de leitura da Bíblia integrados com notificações diárias.",
            type: "FEATURE",
            published: true,
            authorId: defaultUser.id,
          },
          {
            appName: "Harpa Cristã JiK",
            version: "v1.1.2",
            title: "Correção de Playbacks e Cifras",
            description: "Corrigido um bug onde alguns playbacks de áudio não carregavam em conexões lentas.",
            type: "BUGFIX",
            published: true,
            authorId: defaultUser.id,
          }
        ]
      });
    }

    // Re-fetch everything
    categories = await prisma.forumCategory.findMany({
      orderBy: { order: "asc" },
    });
    posts = await prisma.forumPost.findMany({
      where: { published: true },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
          },
        },
      },
      orderBy: [
        { pinned: "desc" },
        { createdAt: "desc" },
      ],
    });
    newsCards = await prisma.newsCard.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      include: { author: { select: { name: true } } },
    });
    hubUpdates = await prisma.hubUpdate.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      include: { author: { select: { name: true } } },
    });
  }

  // 5. Serialize Dates for client component compatibility
  const serializedCategories = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    color: c.color,
    order: c.order,
  }));

  const serializedPosts = posts.map((p) => ({
    id: p.id,
    title: p.title,
    content: p.content,
    published: p.published,
    pinned: p.pinned,
    locked: p.locked,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    imageUrl: p.imageUrl,
    author: {
      id: p.author.id,
      name: p.author.name,
      image: p.author.image,
    },
    category: {
      id: p.category.id,
      name: p.category.name,
      slug: p.category.slug,
      color: p.category.color,
    },
  }));

  const serializedNews = newsCards.map((n) => ({
    id: n.id,
    title: n.title,
    summary: n.summary,
    content: n.content,
    imageUrl: n.imageUrl,
    createdAt: n.createdAt.toISOString(),
    author: {
      name: n.author.name,
    },
  }));

  const serializedUpdates = hubUpdates.map((u) => ({
    id: u.id,
    appName: u.appName,
    version: u.version,
    title: u.title,
    description: u.description,
    type: u.type,
    createdAt: u.createdAt.toISOString(),
    author: {
      name: u.author.name,
    },
  }));

  // Pass session user and initial data to the Client component
  return (
    <HomeClient
      user={session?.user}
      initialPosts={serializedPosts}
      initialCategories={serializedCategories}
      initialNews={serializedNews}
      initialUpdates={serializedUpdates}
    />
  );
}
