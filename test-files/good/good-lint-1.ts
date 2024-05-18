import {wait} from '@augment-vir/common';

export async function doThing() {
    await wait(1);
    if (Math.random() > 0) {
        return 'hi';
    } else {
        return 3;
    }
}
