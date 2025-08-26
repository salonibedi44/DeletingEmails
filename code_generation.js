export class Codes {
    // Static method to convert decimal to hex
    static dec_to_hex(dec) {
        return ("0" + dec.toString(16)).substring(-2);
    }
    
    static generate_code_verifier() {
        var array = new Uint32Array(43); // 43 random bytes for PKCE
        window.crypto.getRandomValues(array);
        return Array.from(array, Codes.dec_to_hex).join('');
    }

    static async sha256(plain) {
        const encoder = new TextEncoder();
        const data = encoder.encode(plain);
        return await window.crypto.subtle.digest('SHA-256', data);
    }
      
    static base64urlencode(a) {
            /*
            This function takes in an array buffer (the hashed verifier) 
            and makes it safe to use in URLs and web requests.
            1. Converts every elt in the ArrayBuffer into a string
            2. Converts string to base-64
            3. Makes the string "url-safe" by replacing + and / with _ and removing trailing =
            */
            var str = "";
            var bytes = new Uint8Array(a);
            var len = bytes.byteLength;
            for (var i = 0; i < len; i++) {
              str += String.fromCharCode(bytes[i]);
            }
            return btoa(str) // converts string to base-64
              .replace(/\+/g, "-")
              .replace(/\//g, "_")
              .replace(/=+$/, "");
    }
      
    static async challenge_from_verifier(v) {
        var hashed = await Codes.sha256(v);
        var base64encoded = Codes.base64urlencode(hashed);
        return base64encoded;
    }

}