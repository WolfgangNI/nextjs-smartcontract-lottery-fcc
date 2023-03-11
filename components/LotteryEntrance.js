import { useWeb3Contract } from "react-moralis"
import { abi, contractAddresses } from "../constants" // this relates to the index.js in the constants folder
import { useMoralis } from "react-moralis"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { useNotification } from "web3uikit"

export default function LotteryEntrance() {
	const { chainId: chainIdHex, isWeb3Enabled, enableWeb3 } = useMoralis()
	const chainId = parseInt(chainIdHex) // using the parseInt() function we make the Hex Number of the chain ID a Dec Number
	const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null // this checks if a chainId is in the contractAddresses Object. If yes take the first calue of the chainId key, if not make it 0
	const [entranceFee, setEntranceFee] = useState("0") // this is initializing a new const as a hook using useState. calling it will be by entranceFee and setting it will be by setEntranceFee. Starting sill be "0"
	const [numberOfPlayers, setNumberOfPlayers] = useState("0")
	const [recentWinner, setRecentWinner] = useState("0")

	const dispatch = useNotification()

	const {
		runContractFunction: enterRaffle,
		isLoading,
		isFetching,
	} = useWeb3Contract({
		abi: abi,
		contractAddress: raffleAddress,
		functionName: "enterRaffle",
		params: {},
		msgValue: entranceFee,
	})

	const { runContractFunction: getEntranceFee } = useWeb3Contract({
		abi: abi,
		contractAddress: raffleAddress,
		functionName: "getEntranceFee",
		params: {},
	})

	const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
		abi: abi,
		contractAddress: raffleAddress,
		functionName: "getNumberOfPlayers",
		params: {},
	})

	const { runContractFunction: getRecentWinner } = useWeb3Contract({
		abi: abi,
		contractAddress: raffleAddress,
		functionName: "getRecentWinner",
		params: {},
	})

	async function updateUI() {
		const entranceFeeFromCall = (
			await getEntranceFee({ onError: (error) => console.log(error) })
		).toString()
		const numberOfPlayersFromCall = (
			await getNumberOfPlayers({ onError: (error) => console.log(error) })
		).toString()
		const recentWinnerFromCall = (
			await getRecentWinner({ onError: (error) => console.log(error) })
		).toString()
		setEntranceFee(entranceFeeFromCall) // ethers.utils.formatUnits( , "ether") is an ethers function to format the number from wei to eth ... why are we not using the parse ethers thing tho??
		setNumberOfPlayers(numberOfPlayersFromCall)
		setRecentWinner(recentWinnerFromCall)
	}

	async function checkForWinnerPickedEvent() {
		const provider = await enableWeb3() // why does this not work: const { provider } = await enableWeb3() ; apparently i could use const provider = await enableWeb3().provider; cGPT: since the provider property is a Proxy object, you might run into issues if you try to destructure it in this way.
		// using enableWeb3 I can get the Provider through useMoralis very easy and dynamic (: )
		/*new ethers.providers.JsonRpcProvider("http://localhost:8545")*/
		console.log("Provider from enableWeb3(): ", provider) // writing it this way the object "provider" gets converted to a string
		const raffle = new ethers.Contract(
			raffleAddress,
			// raffleAddress didnt work when I didnt have all this in a separate function (was undefined), so since it works now maybe it was just bc I was reading it befor it got defined...
			/*"0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"*/ abi,
			provider
		)
		raffle.on("WinnerPicked", () => {
			updateUI()
			console.log("UI Updated")
		})
	}

	useEffect(() => {
		if (isWeb3Enabled) {
			updateUI()
		}
	}, [isWeb3Enabled])

	const handleSuccess = async function (tx) {
		await tx.wait(1)
		// console.log("tx is: " + `obj: ${JSON.stringify(tx)}`)
		handleNewNotification(tx)
		updateUI()
		checkForWinnerPickedEvent()
	}

	const handleNewNotification = function () {
		dispatch({
			type: "info",
			message: "Transaction Complete!",
			title: "Transaction Notification",
			position: "topR",
			// icon: "bell", doesnt work but should with an older version: "web3uikit": "^0.1.170"
		})
	}

	return (
		<div>
			{raffleAddress ? (
				<div className="p-5">
					<button
						className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded ml-auto"
						onClick={async function () {
							await enterRaffle({
								// onComplete: // I can say what should happen when succeeded, when Completed or when it fails with these.
								onSuccess: handleSuccess,
								onError: (error) => console.log(error),
							})
						}}
						disabled={isLoading || isFetching} // when the enter raffle function is loading oder fetching the button is disabled
					>
						{isLoading || isFetching ? (
							<div className="animate-spin spinnter-boarder h-8 w-8 border-b-2 rounded-full"></div>
						) : (
							<div>EnterRaffle</div>
						)}
					</button>

					<div>Entrance Fee is: {ethers.utils.formatUnits(entranceFee, "ether")} ETH</div>
					<div>Number Of Players: {numberOfPlayers}</div>
					<div>Recent Winner: {recentWinner}</div>
				</div>
			) : (
				<div>
					<br />
					No Raffle Address Detected
				</div>
			)}
		</div>
	)
}
