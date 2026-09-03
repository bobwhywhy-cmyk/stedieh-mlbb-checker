// Netlify Function: /.netlify/functions/checkid
// Uses Node's built-in HTTPS module to avoid relying on fetch runtime support.

const https = require("https");

function postJson(url, payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const u = new URL(url);

    const req = https.request({
      protocol: u.protocol,
      hostname: u.hostname,
      port: u.port || 443,
      path: u.pathname + u.search,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
        "User-Agent": "Stedieh-MLBB-Checker/2.0"
      },
      timeout: 15000
    }, (res) => {
      let data = "";
      res.setEncoding("utf8");
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve({
        statusCode: res.statusCode || 500,
        headers: res.headers,
        body: data
      }));
    });

    req.on("timeout", () => {
      req.destroy(new Error("EliteDias request timed out"));
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store"
  };

  if (event.httpMethod === "GET") {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        message: "Stedieh checkid function is online. Send POST with userid and serverid."
      })
    };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({code:"405",message:"Method not allowed"}) };
  }

  try {
    let input = {};
    try { input = JSON.parse(event.body || "{}"); }
    catch { return {statusCode:400,headers,body:JSON.stringify({code:"400",message:"Invalid JSON request"})}; }

    const userid = String(input.userid || "").trim();
    const serverid = String(input.serverid || "").trim();

    if (!userid || !serverid) {
      return {
        statusCode: 400, headers,
        body: JSON.stringify({code:"400",message:"User ID and Server ID are required"})
      };
    }

    if (!/^\d+$/.test(userid) || !/^\d+$/.test(serverid)) {
      return {
        statusCode: 400, headers,
        body: JSON.stringify({code:"400",message:"User ID and Server ID must contain numbers only"})
      };
    }

    const upstream = await postJson("https://api.elitedias.com/checkid", {
      game: "mlbb",
      userid,
      serverid
    });

    let parsed;
    try { parsed = JSON.parse(upstream.body); }
    catch {
      parsed = {
        code: String(upstream.statusCode),
        message: "EliteDias returned a non-JSON response",
        raw: upstream.body.slice(0, 1000)
      };
    }

    // Return the actual EliteDias payload even if upstream uses a non-2xx status.
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(parsed)
    };

  } catch (err) {
    console.error("checkid:", err);
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({
        code:"502",
        message:"Could not reach EliteDias",
        error:String(err && err.message ? err.message : err)
      })
    };
  }
};
