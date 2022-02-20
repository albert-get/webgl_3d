import './index.css'


function MyApp({ Component, pageProps }) {
  return (
        <div style={{width:'100vw',height:'100vh'}}>
          <Component {...pageProps} />
        </div>
  )
}

export default MyApp
