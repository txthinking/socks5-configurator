document.querySelector('#ing').style.display='none';

chrome.storage.local.get('socks5switch', s => {
    s = s.socks5switch || 'on';
    if(s == "on"){
        document.querySelector('#socks5switch').checked = true;
    }
    if(s == "off"){
        document.querySelector('#socks5switch').checked = false;
    }
});
chrome.storage.local.get('socks5server', s => {
    s = s.socks5server || '';
    document.querySelector('#socks5server').value = s;
});
chrome.storage.local.get('bypassswitch', s =>{
    s = s.bypassswitch || 'on';
    if(s == "on"){
        document.querySelector('#bypassswitch').checked = true;
    }
    if(s == "off"){
        document.querySelector('#bypassswitch').checked = false;
    }
});
chrome.storage.local.get('bypassurl', s =>{
    s = s.bypassurl || 'https://txthinking.github.io/bypass/chinadomain.txt';
    document.querySelector('#bypassurl').value = s;
});

document.querySelector('#save').addEventListener("click", async (e) => {
    document.querySelector('#save').style.display = 'none';
    document.querySelector('#ing').style.display = 'block';

    var socks5switch = document.querySelector('#socks5switch').checked;
    var socks5server = document.querySelector('#socks5server').value;
    var bypassswitch = document.querySelector('#bypassswitch').checked;
    var bypassurl = document.querySelector('#bypassurl').value;

    if(socks5switch){
        if(!/.+:\d+/.test(socks5server)){
            alert("Invalid socks5 proxy address");
            document.querySelector('#save').style.display = 'block';
            document.querySelector('#ing').style.display = 'none';
            return;
        }
    }
    chrome.storage.local.set({"socks5switch": socks5switch ? 'on' : 'off'});
    chrome.storage.local.set({"socks5server": socks5server});
    var l = [];
    if(bypassswitch){
        try{
            var r = await fetch(bypassurl);
            if(r.status != 200){
                throw Error(`When fetch bypass list: ${r.status}`);
            }
            var s = await r.text();
            var l1 = s.trim().split('\n');
            l1.forEach(v=>{
                l.push(v.trim());
                l.push("*."+v.trim());
            });
        }catch(e){
            alert(`When fetch bypass list: ${e.message}`);
            document.querySelector('#save').style.display = 'block';
            document.querySelector('#ing').style.display = 'none';
            return;
        }
    }
    chrome.storage.local.set({"bypassswitch": bypassswitch ? 'on' : 'off'});
    chrome.storage.local.set({"bypassurl": bypassurl});
    chrome.storage.local.set({"bypasslist": JSON.stringify(l)});

    if(!socks5switch){
        chrome.proxy.settings.set({
            value: {
                mode: "direct",
            },
        },()=>{
            setTimeout(()=>{
                document.querySelector('#save').style.display = 'block';
                document.querySelector('#ing').style.display = 'none';
            }, 2000);
        });
        return;
    }

    var host = socks5server.substring(0, socks5server.lastIndexOf(':')).replace('[', '').replace(']', '');
    var port = socks5server.substring(socks5server.lastIndexOf(':')+1);
    chrome.proxy.settings.set({
        value: {
            mode: "fixed_servers",
            rules: {
                singleProxy: {
                    scheme: "socks5",
                    host: host,
                    port: parseInt(port),
                },
                bypassList: l,
            },
        },
    },()=>{
        setTimeout(()=>{
            document.querySelector('#save').style.display = 'block';
            document.querySelector('#ing').style.display = 'none';
        }, 1000);
    });
});
