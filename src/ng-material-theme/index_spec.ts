import { Tree } from '@angular-devkit/schematics';
import {
  UnitTestTree,
  SchematicTestRunner,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';

const collectionPath = path.join(__dirname, "../collection.json");
const runner = new SchematicTestRunner("schematics", collectionPath);

let appTree: UnitTestTree;

describe("ng-material-theme", () => {
  beforeEach(async () => {
    appTree = await runner
      .runExternalSchematicAsync(
        "@schematics/angular",
        "workspace",
        { name: "test", version: "10.0.5" })
      .toPromise();

    appTree = await runner
      .runExternalSchematicAsync(
        "@schematics/angular",
        "application",
        { name: "my-app", style: 'scss', projectRoot: './' },
        appTree
      )
      .toPromise();
  });

  it('should add the @angular/material schematic and copy the custom theme files', async () => {
    const tree = await runner.runSchematicAsync(
      'ng-material-theme',
      {},
      appTree
    ).toPromise();

    const packageFile = JSON.parse(tree.read('package.json')!.toString('utf-8'));

    expect(packageFile.dependencies['@angular/material']).toBeTruthy();
  });

  it('should copy the custom theme files to the project root', async () => {
    const tree = await runner.runSchematicAsync(
      'ng-material-theme',
      {},
      appTree
    ).toPromise();

    expect(tree.files).toContain('/src/theme.scss');
    expect(tree.files).toContain('/src/custom-component-themes.scss');
  });

  it("should update the \'styles.scss\' file on \'src\' folder", async () => {
    const tree = await runner.runSchematicAsync(
      'ng-material-theme',
      {},
      appTree
    ).toPromise();

    const styles = tree.read('/src/styles.scss')!.toString('utf-8');

    expect(styles).toContain("@import '~@angular/material/theming';");
    expect(styles).toContain("@import './custom-component-themes.scss';");
    expect(styles).toContain("@import './theme.scss';");
  });

  it('should fail if missing tree', async () => {
    await expectAsync(
      runner.runSchematicAsync(
        'ng-material-theme',
        { name: 'invalid-workspace' },
        Tree.empty(),
      ).toPromise()
    ).toBeRejected();
  });
});
