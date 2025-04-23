import { oai_settings } from "../../../../../../openai.js";
/**
 * OpenAI - 提供与OpenAI API交互的方法
 */
class OpenAI {
  static getSettings() {
    return oai_settings;
  }
}
export default OpenAI;
