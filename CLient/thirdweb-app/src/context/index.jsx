import React, {useContext, createContext} from "react";
import {useAddress, useContract, useMetamask, useContractWrite} from '@thirdweb-dev/react';
import {ethers} from 'ethers';

const StateContext = createContext();

export const StateContextProvider = ({children}) => {
	const {contract} = useContract('0xBf37A3546c74c31299abA2076C7119D5Ab0A3D4E');
	const {mutateAsync: createCampaign} = useContractWrite(contract, 'createCampaign');
	const address = useAddress();
	const connect = useMetamask();

	const publishCampaign = async (form) => {
		try {
			const data = await createCampaign([
				address,
				form.title,
				form.description,
				form.target,
				new Date(form.deadline).getTime(),
				form.image
			])
		} catch (error) {
			console.log(error)
		}
	}

	const getUserCampaigns = async () => {
		const allCampaigns = await getCampaigns();
	
		const filteredCampaigns = allCampaigns.filter((campaign) => campaign.owner === address);
	
		return filteredCampaigns;
	}
	
	const donate = async (pId, amount) => {
		const data = await contract.call('donateToCampaign', pId, { value: ethers.utils.parseEther(amount)});
	
		return data;
	}

	const getCampaigns = async () =>{
		const campaigns = await contract.call('getCampaign');
		
		const parsedCampaigns = campaigns.map((campaign, i) =>({
			owner : campaign.owner,
			title : campaign.title,
			description : campaign.description,
			target : ethers.utils.formatEther(campaign.target.toString()),
			deadline: campaign.deadline.toNumber(),
			amountCollected: ethers.utils.formatEther(campaign.amountCollected.toString()),
			image: campaign.image,
			pId:i
		}))
		return parsedCampaigns;
	}

	const getDonations = async (pId) => {
		const donations = await contract.call('getDonators', pId);
		const numberOfDonations = donations[0].length;

		const parsedDonations = [];

		for(let i = 0; i < numberOfDonations; i++) {
			parsedDonations.push({
				donator: donations[0][i],
				donation: ethers.utils.formatEther(donations[1][i].toString())
			})
		}

		return parsedDonations;
}


	return <StateContext.Provider value={{address, contract, connect, createCampaign: publishCampaign,getCampaigns,getUserCampaigns, donate, getDonations}}>
	{children}
	</StateContext.Provider>
}
export const useStateContext = () => useContext(StateContext);


