import { appColors, generateCSSVariables } from './colors.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSS_FILE_PATH = path.join(__dirname, '../styles/App.css');

function syncColors() {
  try {
    const cssContent = fs.readFileSync(CSS_FILE_PATH, 'utf-8');

    const lightVars = generateCSSVariables(appColors.light);
    const darkVars = generateCSSVariables(appColors.dark, 'color-dark');

    const newThemeBlock = `@theme {
  ${lightVars}

  ${darkVars}
}`;

    const updatedCss = cssContent.replace(
      /@theme\s*\{[\s\S]*?\}/,
      newThemeBlock
    );

    fs.writeFileSync(CSS_FILE_PATH, updatedCss, 'utf-8');

    console.log('Цвета успешно синхронизированы!');
    console.log('Обновлен файл:', CSS_FILE_PATH);
  } catch (_e) {
    process.exit(1);
  }
}

syncColors();

export { syncColors };
