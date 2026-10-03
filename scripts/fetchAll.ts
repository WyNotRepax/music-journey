const url =
    "http://127.0.0.1:54321/functions/v1/refreshUser?name=Gnedby&full=false";
const options = { method: "GET" };

while (true) {
    let success = true;
    try {
        const response = await fetch(url, options);
        const data = await response.json();
        console.log(data);
        if (response.ok) {
            success = true;
        } else {
            success = false;
        }
    } catch (error) {
        console.error(error);
        success = false;
    }
    if (success) break;
}
