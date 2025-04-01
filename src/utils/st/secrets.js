import { callGenericPopup, POPUP_TYPE } from "../../../../../../popup.js";
import { getRequestHeaders } from "../../../../../../../script.js";
import { writeSecret } from "../../../../../../secrets.js";

class Secrets {
  static async getSecrets() {
    const response = await fetch("/api/secrets/view", {
      method: "POST",
      headers: getRequestHeaders(),
    });

    if (response.status === 403) {
      callGenericPopup(
        "<h3>禁止访问</h3><p>要在此处查看您的 API 密钥，请在 config.yaml 文件中将 allowKeysExposure 的值设置为 true，然后重新启动 SillyTavern 服务器。</p>",
        POPUP_TYPE.TEXT
      );
      return;
    }

    if (!response.ok) {
      return;
    }

    const data = await response.json();
    return data;
  }

  /**
   * 设置密钥
   * @param {string} key - 密钥
   * @param {string} value - 密钥值
   */
  static async setSecrets(key, value) {
    await writeSecret(key, value);
  }
}

export default Secrets;
