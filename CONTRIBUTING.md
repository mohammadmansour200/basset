# Code Contributions

## Before starting to code

Please follow these guidelines before starting to code you feature or bugfix.

- If you want to implement a bugfix or feature request from an existing issue, please comment on that issue that you will work on it. This helps us to coordinate what needs to be done and what not.
- If you want to implement a feature request without an existing issue, please create an issue, so we know what you are working on and discuss the feature.

## Before your Pull Request

Please follow these guidelines before sending your pull request and making contributions.

- When you submit a pull request, you agree that your code is published under the [GNU General Public License](https://www.gnu.org/licenses/gpl-3.0.html)
- Please link the issue you are referring to.
- Do not include non-free software or modules with your code.
- Make sure your branch is up to date with the development branch before submitting your pull request.
- Stick to a similar style of code already in the project. Please look at current code to get an idea on how to do this.
- Follow [ES6](http://es6-features.org/) standards in your code. Ex: Use `let` and `const` instead of `var`. Do not use `function(response){//code}` for callbacks, use `(response) => {//code}`.
- Comment your code when necessary. Follow the [JavaScript Documentation and Comments Standard](https://www.drupal.org/docs/develop/standards/javascript/javascript-api-documentation-and-comment-standards) for functions.
- Never use "any" type
- Please test your code. Make sure new features works
- Please make sure your code does not violate any standards set by our linter. It's up to you to make fixes whenever necessary. You can run `npm run lint` to check locally and `npm run lint-fix` to automatically fix smaller issues.
- Please don't add other node-modules only when necessary

# Setting up Your Environment

Make you sure you have the prerequisites listed in [Tuari's website](https://tauri.app/v1/guides/getting-started/prerequisites)

### Install Dependencies

```bash
npm install
```

### Start dev server

```bash
npm run tauri dev
```
