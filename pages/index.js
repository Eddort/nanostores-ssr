import Head from "next/head";
import Image from "next/image";
import { useStore } from "../nanostores";
import { myFirstStore, mySecondStore } from "../stores";
import styles from "../styles/Home.module.css";

export default function Home() {
  const firstStore = useStore(myFirstStore);
  const secondStore = useStore(mySecondStore);

  return (
    <div className={styles.container}>
      <Head>
        <title>test</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to Index page
        </h1>
        <h2>{JSON.stringify(firstStore)}</h2>
        <h2>{JSON.stringify(secondStore)}</h2>
      </main>
    </div>
  );
}
