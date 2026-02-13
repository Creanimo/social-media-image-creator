import { registerIconLibrary } from '@awesome.me/webawesome-pro/dist/webawesome.js';

registerIconLibrary('tabler', {
    resolver: name => `node_modules/@tabler/icons/icons/outline/${name}.svg`,
    mutator: svg => {
        svg.style.fill = 'none';
        svg.setAttribute('stroke', 'currentColor');
    },
});