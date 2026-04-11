import { expect } from '../node_modules/chai/index.js';
import { Router } from '../router/router.mjs';

describe('Router (with mock window)', () => {
    let router;
    let mockWindow;
    let listeners;

    beforeEach(() => {
        listeners = {};
        mockWindow = {
            location: {
                _hash: '',
                get hash() { return this._hash; },
                set hash(val) {
                    this._hash = val;
                    if (listeners['hashchange']) listeners['hashchange']();
                }
            },
            addEventListener: (event, callback) => {
                listeners[event] = callback;
            }
        };
        router = new Router(mockWindow);
    });

    it('should add a route and handle navigation', () => {
        let called = false;
        const path = '#test';
        router.addRoute(path, () => {
            called = true;
        });

        mockWindow.location.hash = path;

        expect(called).to.be.true;
        expect(router.currentRoute).to.equal(path);
    });

    it('should navigate via navigate() method', () => {
        const path = '#test';
        router.addRoute(path, () => {});

        router.navigate(path);
        expect(mockWindow.location.hash).to.equal(path);
    });

    it('should default to #gallery if hash is empty on start', () => {
        let galleryCalled = false;
        router.addRoute('#gallery', () => {
            galleryCalled = true;
        });

        router.start();
        expect(mockWindow.location.hash).to.equal('#gallery');
        expect(galleryCalled).to.be.true;
    });

    it('should navigate to #gallery if an unknown route is accessed', () => {
        let galleryCalled = false;
        router.addRoute('#gallery', () => {
            galleryCalled = true;
        });

        mockWindow.location.hash = '#unknown';

        expect(mockWindow.location.hash).to.equal('#gallery');
        expect(galleryCalled).to.be.true;
    });

    it('should extract base path and ignore query parameters', () => {
        const basePath = '#edit';
        const fullPath = '#edit?id=123';
        let called = false;
        
        router.addRoute(basePath, () => {
            called = true;
        });

        mockWindow.location.hash = fullPath;

        expect(called).to.be.true;
        expect(router.currentRoute).to.equal(fullPath);
    });

    it('should update currentRoute correctly', () => {
        const path = '#settings';
        router.addRoute(path, () => {});

        mockWindow.location.hash = path;

        expect(router.currentRoute).to.equal(path);
    });
});
