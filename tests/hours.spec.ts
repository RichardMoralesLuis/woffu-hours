import { Page, test } from '@playwright/test';
import { config } from 'dotenv';
import { exists, woffuActions, woffuURL } from "./utils";

config();

const emailInput = '[placeholder="Tu e-mail"]';
const passwordInput = '[placeholder="Contraseña"]';
const enterButton = 'form[name="loginForm"] button:has-text("Entrar")';

const buildSetup = (page: Page) => ({
    doLogin: async () => {
        await page.goto(woffuURL);

        await page.locator(emailInput).click();
        await page.locator(emailInput).fill(process.env.EMAIL);

        await page.locator(passwordInput).click();
        await page.locator(passwordInput).fill(process.env.PASSWORD);

        await Promise.all([
            page.waitForNavigation(),
            page.locator(enterButton).click()
        ]);
    },
    ...woffuActions(page)
});


test('fill hours in Woffu with Google authentication', async ({ page }) => {
    const {
        doLogin,
        dismissModal,
        goToReport,
        getDayToFill,
        getModifyButton,
        fillHours,
        hasErrorFillingFutureDays,
        close
    } = buildSetup(page);

    await doLogin();
    await dismissModal();
    await goToReport();

    let dayToFill;
    let canFillCurrentDay = true;
    do {
        dayToFill = await getDayToFill();
        if (dayToFill) {
            dayToFill.click();

            const modifyButton = await getModifyButton();
            if (!await exists(modifyButton)) {
                await close();
                return;
            }

            await fillHours(modifyButton);
            canFillCurrentDay = !await hasErrorFillingFutureDays();
        }
    } while (dayToFill && canFillCurrentDay)

});
