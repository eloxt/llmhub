@echo off
echo Starting
for %%i in (components\ui\*.tsx) do (
  echo Processing: %%~ni
  pnpm dlx shadcn@latest add %%~ni --overwrite
)
echo completed.