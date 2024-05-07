How does this test work?:

TLDR:
Test plugin & generate config > use config to create tw-merge > test tw-merge > remove generated folder

1. Plugin test uses postcss tailwind plugin to parse "@import ..." base css file and generate classes based on what's used in the test.
   `(tailwindcss({content: [...]}))` specifies a path to tw-merge test. This will make sure that all classes used in the test will be generated automatically. After that a config is created based on the parsed css. It's created inside "\_\_generated/config.ts" file for the next test sake

2. Use newly generated config to create tw-merge and test

3. Remove generated folder
