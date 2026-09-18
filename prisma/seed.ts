import { PrismaClient, Role, ArticleStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Bengali News Portal Database Seeding...');

  // 1. Create Default Users (Admin, Reporter, Reader)
  const hashedPassword = await bcrypt.hash('DemoPass123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@songbadprobaho.com' },
    update: {},
    create: {
      name: 'প্রধান সম্পাদক (এডমিন)',
      email: 'admin@songbadprobaho.com',
      role: Role.ADMIN,
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
      emailVerified: true,
      accounts: {
        create: {
          accountId: 'admin-account',
          providerId: 'credential',
          password: hashedPassword,
        },
      },
    },
  });

  const reporter = await prisma.user.upsert({
    where: { email: 'reporter@songbadprobaho.com' },
    update: {},
    create: {
      name: 'শরীফুল ইসলাম',
      email: 'reporter@songbadprobaho.com',
      role: Role.REPORTER,
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      emailVerified: true,
      accounts: {
        create: {
          accountId: 'reporter-account',
          providerId: 'credential',
          password: hashedPassword,
        },
      },
      reporterProfile: {
        create: {
          designation: 'বিশেষ প্রতিনিধি ও অনুসন্ধানী সাংবাদিক',
          bio: 'জাতীয় রাজনীতি, অর্থনীতি ও সমসাময়িক নীতি বিশ্লেষণ নিয়ে এক দশকের বেশি সময় ধরে কাজ করছেন।',
          phone: '+8801700000001',
          twitter: 'https://twitter.com/shariful_probaho',
          isVerified: true,
          totalArticles: 15,
        },
      },
    },
  });

  const demoUser = await prisma.user.upsert({
    where: { email: 'user@songbadprobaho.com' },
    update: {},
    create: {
      name: 'তানভীর আহমেদ',
      email: 'user@songbadprobaho.com',
      role: Role.USER,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      emailVerified: true,
      accounts: {
        create: {
          accountId: 'user-account',
          providerId: 'credential',
          password: hashedPassword,
        },
      },
    },
  });

  console.log('✅ Demo accounts seeded successfully:');
  console.log(`   - Admin: admin@songbadprobaho.com / DemoPass123!`);
  console.log(`   - Reporter: reporter@songbadprobaho.com / DemoPass123!`);
  console.log(`   - User: user@songbadprobaho.com / DemoPass123!`);

  // 2. Seed Categories and Subcategories
  const categoriesData = [
    {
      name: 'জাতীয়',
      slug: 'bangladesh',
      order: 1,
      subcategories: ['রাজধানী', 'সারাদেশ', 'আইন-আদালত', 'অপরাধ'],
    },
    {
      name: 'রাজনীতি',
      slug: 'politics',
      order: 2,
      subcategories: ['নির্বাচন', 'দলীয় সংবাদ', 'সংসদ'],
    },
    {
      name: 'আন্তর্জাতিক',
      slug: 'international',
      order: 3,
      subcategories: ['দক্ষিণ এশিয়া', 'মধ্যপ্রাচ্য', 'ইউরোপ-আমেরিকা', 'ভূরাজনীতি'],
    },
    {
      name: 'অর্থনীতি',
      slug: 'economy',
      order: 4,
      subcategories: ['ব্যাংকিং', 'শেয়ারবাজার', 'বাজেট', 'মুদ্রাস্ফীতি'],
    },
    {
      name: 'খেলাধুলা',
      slug: 'sports',
      order: 5,
      subcategories: ['ক্রিকেট', 'ফুটবল', 'টেনিস', 'বিশ্ব ক্রীড়া'],
    },
    {
      name: 'বিনোদন',
      slug: 'entertainment',
      order: 6,
      subcategories: ['চলচ্চিত্র', 'টেলিভিশন', 'সঙ্গীত', 'ওটিটি'],
    },
    {
      name: 'প্রযুক্তি',
      slug: 'technology',
      order: 7,
      subcategories: ['কৃত্রিম বুদ্ধিমত্তা', 'স্মার্টফোন', 'সাইবার নিরাপত্তা', 'স্টার্টআপ'],
    },
    {
      name: 'জীবনযাপন',
      slug: 'lifestyle',
      order: 8,
      subcategories: ['ভ্রমণ', 'খাবার ও রেসিপি', 'ফ্যাশন', 'সম্পর্ক'],
    },
    {
      name: 'শিক্ষা',
      slug: 'education',
      order: 9,
      subcategories: ['বিশ্ববিদ্যালয়', 'ভর্তি পরীক্ষা', 'উচ্চশিক্ষা ও বৃত্তি'],
    },
    {
      name: 'মতামত',
      slug: 'opinion',
      order: 10,
      subcategories: ['সম্পাদকীয়', 'কলাম', 'বিশ্লেষণ'],
    },
  ];

  const categoryMap = new Map<string, any>();

  for (const cat of categoriesData) {
    const createdCategory = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, order: cat.order },
      create: {
        name: cat.name,
        slug: cat.slug,
        order: cat.order,
      },
    });
    categoryMap.set(cat.slug, createdCategory);

    for (const subName of cat.subcategories) {
      const subSlug = `${cat.slug}-${encodeURIComponent(subName.toLowerCase())}`;
      await prisma.subcategory.upsert({
        where: { slug: subSlug },
        update: { name: subName },
        create: {
          name: subName,
          slug: subSlug,
          categoryId: createdCategory.id,
        },
      });
    }
  }

  console.log('✅ Categories and subcategories seeded.');

  // 3. Seed Tags
  const tagsData = [
    { name: 'নির্বাচন ২০২৬', slug: 'election-2026' },
    { name: 'বাংলাদেশ ক্রিকেট', slug: 'bangladesh-cricket' },
    { name: 'মেগা প্রকল্প', slug: 'mega-projects' },
    { name: 'কৃত্রিম বুদ্ধিমত্তা', slug: 'artificial-intelligence' },
    { name: 'বৈদেশিক মুদ্রার রিজার্ভ', slug: 'forex-reserve' },
    { name: 'ডিজিটাল রূপান্তর', slug: 'digital-transformation' },
  ];

  const tagMap = new Map<string, any>();
  for (const t of tagsData) {
    const createdTag = await prisma.tag.upsert({
      where: { slug: t.slug },
      update: {},
      create: t,
    });
    tagMap.set(t.slug, createdTag);
  }

  // 4. Seed Rich Bengali News Articles
  const articlesData = [
    {
      title: 'দেশের অর্থনীতিতে স্বস্তির বার্তা: এক মাসে রেমিট্যান্স ছাড়াল ২.৫ বিলিয়ন ডলার',
      slug: 'economy-remittance-surges-past-two-point-five-billion',
      categorySlug: 'economy',
      excerpt: 'প্রবাসী আয়ের অভাবনীয় প্রবৃদ্ধিতে কেন্দ্রীয় ব্যাংকের বৈদেশিক মুদ্রার রিজার্ভে ইতিবাচক ধারা ফিরে এসেছে বলে জানিয়েছেন অর্থনীতিবিদরা।',
      content: `
        <p class="lead">প্রবাসী বাংলাদেশিদের পাঠানো রেমিট্যান্সে নতুন মাইলফলক রচিত হয়েছে। সদ্য সমাপ্ত মাসে বৈধ পথে আসা রেমিট্যান্সের পরিমাণ আড়াই বিলিয়ন মার্কিন ডলার অতিক্রম করেছে, যা পূর্ববর্তী বছরের একই সময়ের তুলনায় প্রায় ২৪ শতাংশ বেশি।</p>
        <h2>বৈদেশিক মুদ্রার মজুতে স্থিতিশীলতা</h2>
        <p>বাংলাদেশ ব্যাংকের তথ্য অনুযায়ী, প্রবাসীদের পাঠানো অর্থ বৈধ ব্যাংকিং চ্যানেলে উৎসাহিত করতে সরকার ঘোষিত আড়াই শতাংশ নগদ প্রণোদনা এবং বিনিময় হারের সমন্বয় গুরুত্বপূর্ণ ভূমিকা পালন করেছে। বিশেষ করে মধ্যপ্রাচ্য, যুক্তরাষ্ট্র এবং যুক্তরাজ্য থেকে রেমিট্যান্সের প্রবাহ ছিল উল্লেখযোগ্য।</p>
        <blockquote>
          "বৈধ পথে রেমিট্যান্স পাঠানোর যে সচেতনতা তৈরি হয়েছে, তা ধরে রাখা গেলে বৈদেশিক বাণিজ্যের চলতি হিসাবের ঘাটতি দ্রুত কাটিয়ে ওঠা সম্ভব হবে।"
          <cite>— ড. মাহফুজুল হক, সিনিয়র অর্থনীতিবিদ</cite>
        </blockquote>
        <h2>রপ্তানি ও রেমিট্যান্সের যৌথ প্রভাব</h2>
        <p>একই সাথে দেশের তৈরি পোশাক খাতের রপ্তানি আয়েও প্রবৃদ্ধি দেখা যাচ্ছে। ইউরোপ ও আমেরিকার বাজারে নতুন মৌসুমের পোশাক সরবরাহের আদেশ বাড়ায় রপ্তানিকারকদের মধ্যেও আশাবাদ তৈরি হয়েছে। বিশেষজ্ঞরা বলছেন, মুদ্রাস্ফীতি নিয়ন্ত্রণে রেখে আমদানি ব্যয়ের ভারসাম্য রক্ষা করা এখন প্রধান অগ্রাধিকার হওয়া উচিত।</p>
      `,
      coverImage: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1200&auto=format&fit=crop&q=80',
      coverImageCaption: 'কেন্দ্রীয় ব্যাংকে বৈদেশিক মুদ্রার রিজার্ভ বৃদ্ধি পেয়েছে। ছবি: প্রতীকী',
      readingTime: 4,
      isFeatured: true,
      isBreaking: true,
      isTrending: true,
      views: 3420,
      tags: ['forex-reserve', 'digital-transformation'],
    },
    {
      title: 'টি-টোয়েন্টি সিরিজে চমক জাগানিয়া জয়: শেষ ওভারে অবিস্মরণীয় ব্যাটিংয়ে জয়ী বাংলাদেশ',
      slug: 'bangladesh-cricket-thrilling-victory-in-final-over',
      categorySlug: 'sports',
      excerpt: 'শ্বাসরুদ্ধকর শেষ ওভারে ১২ রানের সমীকরণ মিলিয়ে স্বাগতিক দর্শকদের আনন্দের জোয়ারে ভাসালেন তরুণ অলরাউন্ডার।',
      content: `
        <p class="lead">মিরপুর শেরেবাংলা জাতীয় ক্রিকেট স্টেডিয়ামে টানটান উত্তেজনার ম্যাচে শেষ বলের বাউন্ডারিতে ৩ উইকেটে জয় তুলে নিল বাংলাদেশ জাতীয় ক্রিকেট দল।</p>
        <h2>উত্তেজনার শেষ মুহূর্ত</h2>
        <p>১৬৫ রানের লক্ষ্যে ব্যাট করতে নেমে শুরুতেই টপ অর্ডারের ৩ উইকেট হারিয়ে বিপদে পড়েছিল টাইগাররা। তবে মিডল অর্ডারের দায়িত্বশীল ইনিংস এবং শেষ দিকে ৭ বলে ২১ রানের মারকুটে ক্যামিও ম্যাচ ঘুরিয়ে দেয়।</p>
        <p>অধিনায়ক ম্যাচ শেষে বলেন, "ছেলেরা শেষ বল পর্যন্ত বিশ্বাস হারায়নি। হোম কন্ডিশনে সমর্থকদের এই উল্লাস আমাদের আত্মবিশ্বাস আরও বাড়িয়ে দিল।"</p>
      `,
      coverImage: 'https://images.unsplash.com/photo-1531415074868-036b107e775a?w=1200&auto=format&fit=crop&q=80',
      coverImageCaption: 'উত্তেজনাকর ম্যাচে জয় উদযাপনে বাংলাদেশ ক্রিকেট দল।',
      readingTime: 3,
      isFeatured: true,
      isBreaking: false,
      isTrending: true,
      views: 5890,
      tags: ['bangladesh-cricket'],
    },
    {
      title: 'প্রযুক্তিতে নতুন দিগন্ত: বাংলা ভাষায় কৃত্রিম বুদ্ধিমত্তা মডেল উন্মোচন',
      slug: 'bangla-large-language-model-ai-breakthrough',
      categorySlug: 'technology',
      excerpt: 'বিশ্বের অন্যতম শীর্ষ গবেষণা প্রতিষ্ঠান ও দেশীয় প্রকৌশলীদের যৌথ উদ্যোগে তৈরি হলো সর্ববৃহৎ বাংলা এলএলএম।',
      content: `
        <p class="lead">মাতৃভাষা বাংলায় উচ্চমানের কৃত্রিম বুদ্ধিমত্তা সেবা দিতে আনুষ্ঠানিকভাবে যাত্রা শুরু করল নতুন বাংলা লার্জ ল্যাঙ্গুয়েজ মডেল।</p>
        <h2>প্রকল্পের উদ্দেশ্য ও প্রযুক্তিগত সক্ষমতা</h2>
        <p>এই মডেলটি কোটি কোটি বাংলা বাক্য ও ব্যাকরণগত প্যাটার্ন নিয়ে প্রশিক্ষণ দেওয়া হয়েছে। এটি প্রশাসনিক নথিপত্র সারসংক্ষেপ তৈরি, স্বাস্থ্য পরামর্শ ও আইনি সহায়তায় নির্ভুল তথ্য প্রদানে সক্ষম।</p>
        <p>তথ্যপ্রযুক্তি বিশেষজ্ঞরা বলছেন, এর ফলে সরকারি দপ্তর ও শিক্ষাপ্রতিষ্ঠানে প্রযুক্তির অন্তর্ভুক্তি বহুগুণ বৃদ্ধি পাবে।</p>
      `,
      coverImage: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=1200&auto=format&fit=crop&q=80',
      coverImageCaption: 'বাংলা কৃত্রিম বুদ্ধিমত্তা মডেল নিয়ে গবেষকদের কর্মশালা।',
      readingTime: 5,
      isFeatured: false,
      isBreaking: false,
      isTrending: true,
      views: 2940,
      tags: ['artificial-intelligence', 'digital-transformation'],
    },
    {
      title: 'রাজধানীর যানজট নিরসনে নতুন মেট্রোরেল রুটের ট্রায়াল রান শুরু',
      slug: 'dhaka-metro-rail-new-route-trial-run-commences',
      categorySlug: 'bangladesh',
      excerpt: 'পরীক্ষামূলক চলাচলের প্রথম দিনেই মানুষের মধ্যে ব্যাপক উদ্দীপনা; আগামী মাসে পূর্ণাঙ্গ বাণিজ্যিক কার্যক্রম শুরুর আশা।',
      content: `
        <p class="lead">রাজধানী ঢাকার যানজটের তীব্রতা হ্রাসে আরও একটি গুরুত্বপূর্ণ ধাপ অতিক্রম করল ম্যাস র‍্যাপিড ট্রানজিট (এমআরটি)। আজ সকালে নতুন অংশের ট্রায়াল রান সফলভাবে সম্পন্ন হয়েছে।</p>
        <h2>সুবিধা পাবেন লাখ লাখ যাত্রী</h2>
        <p>প্রকল্প পরিচালকের দেওয়া তথ্যমতে, নতুন রুট পুরোদমে চালু হলে মাত্র ২৫ মিনিটে শহরের এক প্রান্ত থেকে অন্য প্রান্তে পৌঁছানো সম্ভব হবে। নিরাপত্তা ব্যবস্থার শতভাগ নিরীক্ষা শেষে যাত্রীদের জন্য টিকিট উন্মুক্ত করা হবে।</p>
      `,
      coverImage: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&auto=format&fit=crop&q=80',
      coverImageCaption: 'রাজধানীর নতুন রুটে মেট্রোরেলের পরীক্ষামূলক চলাচল।',
      readingTime: 3,
      isFeatured: false,
      isBreaking: true,
      isTrending: true,
      views: 4120,
      tags: ['mega-projects'],
    },
    {
      title: 'আন্তর্জাতিক জলবায়ু সম্মেলনে উন্নয়নশীল দেশগুলোর জন্য নতুন তহবিলের ঘোষণা',
      slug: 'cop-summit-climate-finance-developing-nations',
      categorySlug: 'international',
      excerpt: 'জলবায়ু পরিবর্তনের ঝুঁকিতে থাকা উপকূলীয় অঞ্চল রক্ষায় ১০০ বিলিয়ন ডলারের সহায়তা প্যাকেজে সম্মতি দিল উন্নত দেশগুলো।',
      content: `
        <p class="lead">বিশ্বব্যাপী চরম আবহাওয়া ও সমুদ্রপৃষ্ঠের উচ্চতা বৃদ্ধির অভিঘাত মোকাবেলায় ঐক্যমতে পৌঁছেছে জাতিসংঘ জলবায়ু শীর্ষ সম্মেলনের প্রতিনিধি দল।</p>
        <h2>ক্ষতিপূরণ ও অভিযোজন</h2>
        <p>বাংলাদেশসহ স্বল্পোন্নত দেশগুলোর প্রতিনিধিরা উপকূলীয় বাঁধ নির্মাণ, লবণাক্ততাসহিষ্ণু শস্য উদ্ভাবন এবং নবায়নযোগ্য শক্তিতে বিনিয়োগের জন্য সরাসরি অনুদানের ওপর জোর দিয়েছেন।</p>
      `,
      coverImage: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?w=1200&auto=format&fit=crop&q=80',
      coverImageCaption: 'আন্তর্জাতিক জলবায়ু সম্মেলনে বিশ্বনেতাদের সমাপনী অধিবেশন।',
      readingTime: 4,
      isFeatured: false,
      isBreaking: false,
      isTrending: false,
      views: 1840,
      tags: [],
    },
    {
      title: 'চলচ্চিত্রে নতুন ধারা: আন্তর্জাতিক চলচ্চিত্র উৎসবে সেরা ছবির পুরস্কার জিতল দেশি সিনেমা',
      slug: 'bangladeshi-film-wins-prestigious-award-at-international-film-festival',
      categorySlug: 'entertainment',
      excerpt: 'গ্রামীণ জীবনের আবহ ও মানবিক দ্বন্দ্ব নিয়ে নির্মিত সিনেমাটি বিশ্বমঞ্চে সমালোচকদের ভূয়সী প্রশংসা অর্জন করেছে।',
      content: `
        <p class="lead">আন্তর্জাতিক চলচ্চিত্র উৎসবে দেশের গৌরব বাড়াল তরুণ নির্মাতার নতুন পূর্ণদৈর্ঘ্য চলচ্চিত্র। প্রতিযোগিতার মূল বিভাগে ছবিটি সেরা পরিচালকের পুরস্কার অর্জন করেছে।</p>
      `,
      coverImage: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80',
      coverImageCaption: 'পুরস্কার বিতরণী মঞ্চে নির্মাতা ও কলাকুশলীবৃন্দ।',
      readingTime: 3,
      isFeatured: false,
      isBreaking: false,
      isTrending: false,
      views: 2150,
      tags: [],
    },
  ];

  for (const art of articlesData) {
    const category = categoryMap.get(art.categorySlug);
    if (!category) continue;

    const existing = await prisma.article.findUnique({
      where: { slug: art.slug },
    });

    if (!existing) {
      const createdArticle = await prisma.article.create({
        data: {
          title: art.title,
          slug: art.slug,
          excerpt: art.excerpt,
          content: art.content,
          coverImage: art.coverImage,
          coverImageCaption: art.coverImageCaption,
          status: ArticleStatus.PUBLISHED,
          authorId: reporter.id,
          categoryId: category.id,
          publishedAt: new Date(Date.now() - Math.floor(Math.random() * 86400000 * 3)),
          readingTime: art.readingTime,
          isFeatured: art.isFeatured,
          isBreaking: art.isBreaking,
          isTrending: art.isTrending,
          views: art.views,
          seoTitle: art.title,
          seoDescription: art.excerpt,
        },
      });

      // Connect tags
      for (const tagSlug of art.tags) {
        const tag = tagMap.get(tagSlug);
        if (tag) {
          await prisma.articleTag.create({
            data: {
              articleId: createdArticle.id,
              tagId: tag.id,
            },
          });
        }
      }

      // Add a sample comment
      await prisma.comment.create({
        data: {
          content: 'চমৎকার এবং বস্তুনিষ্ঠ প্রতিবেদন। এমন বিশ্লেষণধর্মী লেখা আরও বেশি প্রত্যাশা করি।',
          articleId: createdArticle.id,
          userId: demoUser.id,
        },
      });

      // Add a sample like
      await prisma.like.create({
        data: {
          articleId: createdArticle.id,
          userId: demoUser.id,
        },
      });
    }
  }

  // 5. Seed Advertisements
  await prisma.advertisement.createMany({
    data: [
      {
        title: 'প্রিমিয়াম ব্র্যান্ড ব্যানার',
        imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop&q=80',
        targetUrl: 'https://example.com',
        placement: 'HEADER_BANNER',
        isActive: true,
      },
      {
        title: 'প্রযুক্তি মেলা পার্টনার ব্যানার',
        imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=80',
        targetUrl: 'https://example.com',
        placement: 'SIDEBAR',
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Articles, tags, comments, likes, and advertisements seeded.');
  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
