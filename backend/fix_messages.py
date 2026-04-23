content = open('C:/Users/gnaes/my-fullstack-projects/travel-social-app/frontend/src/components/Messages.jsx', 'r').read()
if 'Trip Groups' in content:
    print("File is correct! Groups section exists.")
else:
    print("File is WRONG - groups section missing. VS Code not saving!")