To generate output css, run

```
  cd test-project
  <!-- normal -->
  npx tailwindcss -i ./src/input.css -o ./src/output.css --watch
  <!-- minified -->
  npx tailwindcss -i ./src/input.css -o ./src/output-minified.css -m --watch
```
