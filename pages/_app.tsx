import type { AppProps } from 'next/app';
    import 'react-quill/dist/quill.snow.css';

    function MyApp({ Component, pageProps }: AppProps,) {
      return <Component {...pageProps} />;
    }

    export default MyApp;
