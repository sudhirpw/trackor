import { AppProps } from "next/app";
import Head from "next/head";
import "../styles/globals.css";
import { useEffect } from "react";
// import { analytics } from "../src/lib/firebase";

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // analytics?.then((instance) => {
    //   if (instance) {
    //     console.log("FA ✔️");
    //   } else {
    //     console.warn("FA ❌");
    //   }
    // });
  }, []);

  return (
    <>
      <Head>
        <title>Payment Tracker</title>
        <link rel="icon" href="/logo.png" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
