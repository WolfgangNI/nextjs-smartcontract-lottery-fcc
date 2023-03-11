// all this is the manual way of doing it, just to understand whats going on. the real life solution is using web3uikit

import { useMoralis } from "react-moralis"
import { useEffect } from "react"

export default function ManualHeader() {
	const { enableWeb3, account, isWeb3Enabled, Moralis, deactivateWeb3, isWeb3EnableLoading } =
		useMoralis()

	useEffect(() => {
		if (isWeb3Enabled) return
		if (typeof window !== "undefined") {
			if (window.localStorage.getItem("connected")) {
				enableWeb3()
			}
		}
	}, [isWeb3Enabled]) // [] means it runs once on load, [isWeb3enabled] means it runs when isWeb3enabled changes, nothing means it runs everytime anything renders

	useEffect(() => {
		Moralis.onAccountChanged((account) => {
			console.log(`Account changed to ${account}`)
			if (account == null) {
				window.localStorage.removeItem("connected")
				deactivateWeb3()
				console.log("Null account found -> deactivateWeb3")
			}
		})
	}, [])

	return (
		<div>
			{account ? (
				<div>
					Connected to {account.slice(0, 6)}...{account.slice(account.length - 4)}
				</div>
			) : (
				<button
					onClick={async () => {
						await enableWeb3()
						if (typeof window !== "undefined") {
							// this is to pevent a certain version of next js' bug or sth where it has a hard time with the window object
							window.localStorage.setItem("connected", "injected") // set a reminder that the user wanted to connect at some point so when they reload it will reconnect automatically
						}
					}}
					disabled={isWeb3EnableLoading} // this disables the buttons if we are loading (waiting for metamask to connect)
				>
					Connect
				</button>
			)}
		</div>
	)
}
