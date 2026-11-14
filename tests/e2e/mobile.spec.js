import {test,expect} from '@playwright/test';
import {locations} from '../../src/data/locations.js';
for(const width of [320,390,1280])for(const reducedMotion of ['no-preference','reduce'])test(`${width}px ${reducedMotion} map and all ten places`,async({page},info)=>{
 test.setTimeout(90000);await page.setViewportSize({width,height:844});await page.emulateMedia({reducedMotion});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await page.locator('#loading-overlay').waitFor({state:'detached'});
 await page.waitForFunction(()=>{let m=document.getElementById('map')._warmMap;return m&&m.isStyleLoaded()&&m.queryRenderedFeatures().length>0},null,{timeout:45000});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();await expect(page.locator('#sidebar')).not.toBeVisible();
 if(reducedMotion==='no-preference')await page.screenshot({path:info.outputPath(`utt-map-${width}.png`)});
 for(const loc of locations){
  await page.getByLabel('Explore Locations').click();await expect(page.getByLabel('Close Explore')).toBeFocused();
  if(loc===locations[0]){for(const n of ['Zoom in','Zoom out','Reset map'])await page.getByRole('button',{name:n,exact:true}).click();if(reducedMotion==='no-preference')await page.screenshot({path:info.outputPath(`utt-panel-${width}.png`)})}
  const card=page.locator(`.location-item[data-id="${loc.id}"]`);await card.scrollIntoViewIfNeeded();await card.locator('h3').click();await expect(page.locator('#sidebar')).not.toBeVisible();
  const popup=page.locator('.leaflet-popup-content');await expect(popup).toBeVisible();await expect(popup).toContainText(loc.title);await page.waitForFunction(()=>{let m=document.getElementById('map')._warmMap;return m&&m.isStyleLoaded()&&m.queryRenderedFeatures().length>0},null,{timeout:45000});if(loc===locations[0]&&reducedMotion==='no-preference')await page.screenshot({path:info.outputPath(`utt-selected-${width}.png`)});await popup.getByRole('button',{name:'More Info',exact:true}).click();
  const modal=page.locator('#location-modal');await expect(modal).toBeVisible();await expect(modal.locator('h2')).toHaveText(loc.title);await expect(modal.getByRole('button',{name:'Close modal',exact:true})).toBeFocused();
  const box=await modal.locator('.modal-content').boundingBox();expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(width+1);expect(box.y).toBeGreaterThanOrEqual(0);expect(box.y+box.height).toBeLessThanOrEqual(845);
  if(loc===locations[0]&&reducedMotion==='no-preference')await page.screenshot({path:info.outputPath(`utt-detail-${width}.png`)});
  await page.keyboard.press('Escape');await expect(modal).not.toBeVisible();await expect(popup.getByRole('button',{name:'More Info',exact:true})).toBeFocused();await page.getByRole('button',{name:'Close popup'}).click();
 }
 await page.getByLabel('Explore Locations').click();await page.keyboard.press('Escape');await expect(page.getByLabel('Explore Locations')).toBeFocused();expect(errors).toEqual([]);
});
