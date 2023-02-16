// connect to Moralis server

const serverUrl = "https://9bvk4bfdrxzy.usemoralis.com:2053/server";
const appId = "l3HvZwULdTqR6vs9jM8ZR3PDu4HUhV3SsYXjdFp2";
Moralis.start({ serverUrl, appId });

//Moralis.initialize(l3HvZwULdTqR6vs9jM8ZR3PDu4HUhV3SsYXjdFp2);
//Moralis.serverURL = "https://9bvk4bfdrxzy.usemoralis.com:2053/server";
// let uname1 = 

let homepage = "http://127.0.0.1:5500/index.html";
if (Moralis.User.current() == null && window.location.href != homepage) {
    document.querySelector('body').style.display = 'none';
    window.location.href = "index.html";
}

// if (document.getElementById('uname').value != null) { 
//     let content = `<div class="invalid-feedback">
//         Please choose a username.
//         </div>`
// }

login = async () => {
    await Moralis.authenticate().then(async function (user) {
        user.set("name", document.getElementById('uname').value);
        user.set("email", document.getElementById('uemail').value);
        await user.save();
        window.location.href = "dashboard.html";
    })
}

logout = async () => {
    await Moralis.User.logOut();
    window.location.href = "index.html";
}

getTransactions = async () => {
    // get mainnet transactions for the current user
    // const transactions = await Moralis.Web3API.account.getTransactions();

    // get BSC transactions for a given address
    // with most recent transactions appearing first
    const options =
    {
        chain: "rinkeby",
        address: Moralis.User.current().get('ethAddress'),
        order: "desc",
    };
    const transactions = await Moralis.Web3API.account.getTransactions(options);

    console.log(transactions);

    if (transactions.total > 0) {
        let table = `
        <table class="table">
        <thead>
            <tr>
                <th scope = "col">Hash</th>
                <th scope = "col">Block Number</th>
                <th scope = "col">Age</th>
                <th scope = "col">Type</th>
                <th scope = "col">From/To</th>
                <th scope = "col">Fee</th>
                <th scope = "col">Value</th>
            </tr>
        </thead>
        <tbody id = "theTransactions">
        </tbody>
        </table>
        `
        document.querySelector('#table_trans').innerHTML = table;

        transactions.result.forEach(t => {
            let content = `
            <tr>
                <td><a href = 'https://rinkeby.etherscan.io/tx/${t.hash}' target = "_blank" rel = "noopener noreferrer">${t.hash}</a></td>
                <td><a href = 'https://rinkeby.etherscan.io/block/${t.block_number}' target = "_blank" rel = "noopener noreferrer">${t.block_number}</a></td>
                <td>${t.block_timestamp}</td>
                <td>${t.from_address == Moralis.User.current().get('ethAddress') ? 'Outgoing' : 'Incoming'}</td>
                <td><a href = 'https://rinkeby.etherscan.io/address/${t.from_address}' target = "_blank" rel = "noopener noreferrer">${t.from_address}</a></td>
                <td>${((t.gas * t.gas_price) / 1e18).toFixed(5)} ETH</td>
                <td>${(t.value / 1e18).toFixed(3)} ETH</td>
            </tr>
            `
            theTransactions.innerHTML += content;
        })
    }
}

getBalance = async () => {
    // get mainnet native balance for the current user
    // const balance = await Moralis.Web3API.account.getNativeBalance();

    // get BSC native balance for a given address
    const ethBal = await Moralis.Web3API.account.getNativeBalance();
    const ropstenBal = await Moralis.Web3API.account.getNativeBalance({chain: "ropsten"});
    const rinkebyBal = await Moralis.Web3API.account.getNativeBalance({chain: "rinkeby"});

    let content = document.querySelector('#ubal').innerHTML = 
    `
    <table class = "table">
        <thead>
            <tr>
                <th scope = "col">Chain</th>
                <th scope = "col">Balance</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <th>Ether</th>
                <td>${(ethBal.balance/1e18).toFixed(5)} ETH</td>
            </tr>
            <tr>
                <th>Ropsten</th>
                <td>${(ropstenBal.balance/1e18).toFixed(5)} ETH</td>
            </tr>
            <tr>
                <th>Rinkeby</th>
                <td>${(rinkebyBal.balance/1e18).toFixed(5)} ETH</td>
            </tr>
        </tbody>
    </table>
    `
}

getNFTs = async () => {
    let nfts = await Moralis.Web3API.account.getNFTs({chain: 'rinkeby'});
    let tableOfNFTs = document.querySelector('#table_nft');
    if (nfts.result.length > 0) {
        nfts.result.forEach(n => {
            let metadata = JSON.parse(n.metadata);
            let content =`
            <div class="card col-md-2">
                    <img src="${fixURL(metadata.image)}" class="card-img-top" height=300>
                    <div class="card-body">
                        <h5 class="card-title">${metadata.name}</h5>
                        <p class="card-text">${metadata.description}</p>
                </div>
            </div>
            `
            tableOfNFTs.innerHTML += content;
        })
    }

    // *****resync token metadata/uri, if token_uri is null resync uri 1st********************************////////////////////////////////
    
    // const options = {
    //     chain: 'rinkeby',
    //     address: "0x459ff4125a741240a11686f9f8bf8911bc85ad51",
    //     token_id: "2",
    //     flag: "metadata",
    // };
    // const nfts = await Moralis.Web3API.token.reSyncMetadata(options);

    // console.log(nfts);
    // let metadata = JSON.parse(nfts.result[1].metadata);
    // console.log(metadata.image);
}

fixURL = (url) => {
    if (url.startsWith("ipfs")) {
        return "https://ipfs.moralis.io:2053/ipfs/" + url.split("ipfs://").slice(-1)
    }
    else {
        return url + "?format=json"
    }
}

if (document.querySelector('#btn_login') != null) { document.querySelector('#btn_login').onclick = login; }
if (document.querySelector('#btn_logout') != null) { document.querySelector('#btn_logout').onclick = logout; }
if (document.querySelector('#get_trans_link') != null) { document.querySelector('#get_trans_link').onclick = getTransactions; }
if (document.querySelector('#get_bal_link') != null) { document.querySelector('#get_bal_link').onclick = getBalance; }
if (document.querySelector('#get_nfts_link') != null) { document.querySelector('#get_nfts_link').onclick = getNFTs; }