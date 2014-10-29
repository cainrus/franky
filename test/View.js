describe("Views as templates processing framework", function () {

    it("declares views by let method", function () {
        x.views.let("helloName", "hello [% name %]").
           let("helloNameDef", "hello [% name %]", {
               name: 'Karl'
           });

        expect(
           x.views.get("helloName", {a: 1})
        ).toBe('hello ');

        expect(
           x.views.get("helloName", {name: 'Mark'})
        ).toBe('hello Mark');

        expect(
           x.views.get("helloNameDef")
        ).toBe('hello Karl')
   });

    it("has ability to change syntax rules", function () {
        x.views.setParseRe(/{\s+([^}]+)\s+}/g);

        x.views.
          let("test", "hello world").
          let("test2", "here is { variable } something for { variable2 }");

        expect(
          x.views.get("test")
        ).toBe('hello world');

        expect(
          x.views.get("test2", {
              "variable": "exists",
              "variable2": "me"
          })
        ).toBe('here is exists something for me');
    });

    it("may get values from object path", function () {
        x.views.setParseRe(/{\s+([^}]+)\s+}/g);

        x.views.let("testJpath", "here is { jpath:x.y.z }");

        expect(
            x.views.get("testJpath", {
                x: {
                    y: {
                        z: "hopla"
                    }
                }
            })
        ).toBe('here is hopla');
    });

    it("understands calls for views inside templates", function () {
        x.views.setParseRe(/{\s+([^}]+)\s+}/g);

        x.views.let("t1", "blah blah { view:t2 }").
            let("t2", "blah blah { view:t3 }").
            let("t3", "blah blah");

        expect(
            x.views.get("t1")
        ).toBe('blah blah blah blah blah blah');
    });

    it("creates custom rules for template processing", function () {
        x.views.parseRules.revert = function (key) {
            return function (d) {
                return key.split('').reverse().join('');
            };
        };

        x.views.let("testOlolo", "here is { revert:something }");

        expect(
            x.views.get("testOlolo")
        ).toBe('here is gnihtemos');
    });

    it("inherits views", function () {
        x.views.let("t1", "blah blah { view:t2 }").
            let("t2", "blah blah { view:t3 }").
            let("t3", "blah blah");

        var customViews = new x.View(x.views);
            customViews.let("t3", "oops");

        expect(
            customViews.get("t1", {views:customViews})
        ).toBe('blah blah blah blah oops');
    });

    it("constructs document", function () {
        x.views.
            let('document', '{ doctype }<html{ document-attrs }><head>{ head }</head><body{ body-attrs }>{ body-content }</body></html>').
            let('head', '<title>{ title }</title>{ styles }{ scripts }').
            let('doctype', '<!DOCTYPE html>').
            let('document-attrs', ' lang="ru"').
            let('body-content', 'hello world').
            let('title', 'base title').
            let('styles', '<style>body {font-size: 1em;}</style>').
            let('scripts', '<script>alert("hello world")</script>').
            let('body-attrs', ' class="b-page"');

        var customViews = new x.View(x.views);

        expect(
            customViews.get("document", {views:customViews})
        ).toBe(
            '<!DOCTYPE html><html lang="ru">' +
            '<head>' +
            '<title>base title</title>' +
            '<style>body {font-size: 1em;}</style>' +
            '<script>alert("hello world")</script>' +
            '</head><body class="b-page">hello world</body></html>'
        );

        customViews.let("t3", "oops").
            let("title", "modified title").
            let("body-content", "Meine lieben Augustin");

        expect(
            customViews.get("document", {views:customViews})
        ).toBe(
            '<!DOCTYPE html><html lang="ru"><head><title>modified title</title><style>body {font-size: 1em;}</style><script>alert("hello world")</script></head><body class="b-page">Meine lieben Augustin</body></html>'
        );

        var extraCustomViews = new x.View(customViews);
        extraCustomViews.let("title", "uber title");

        expect(
            customViews.get("document", {views:extraCustomViews})
        ).toBe('<!DOCTYPE html><html lang="ru"><head><title>uber title</title><style>body {font-size: 1em;}</style><script>alert("hello world")</script></head><body class="b-page">Meine lieben Augustin</body></html>');

    });
});