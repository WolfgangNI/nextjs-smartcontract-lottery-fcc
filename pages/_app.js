import "@/styles/globals.css"
import { MoralisProvider } from "react-moralis"
import { NotificationProvider } from "web3uikit"

function MyApp({ Component, pageProps }) {
	return (
		// initializeOnMount={false} means that we dont want additional functionality and/or to hook into a server  but want it opensource or sth...
		<MoralisProvider initializeOnMount={false}>
			<NotificationProvider>
				<Component {...pageProps} />
			</NotificationProvider>
		</MoralisProvider>
		// components is wrapped in NotificationProvider which is wrapped in MoralisProvider
	)
}

export default MyApp
