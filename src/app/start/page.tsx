import Head from "next/head";

export default function Home() {
  return (
    <div>
      <Head>
        <title>Hadbit MVP</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        test
        <h1>Welcome to Hadbit MVP!</h1>
        <p>This is a minimal viable product built with Next.js.</p>
      </main>

      <footer>
        <p>&copy; 2025 Hadbit</p>
      </footer>
    </div>
  );
}
