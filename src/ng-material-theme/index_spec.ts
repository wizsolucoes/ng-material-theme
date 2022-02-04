import { Tree } from '@angular-devkit/schematics';
import {
  UnitTestTree,
  SchematicTestRunner,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';
import * as fs from 'fs';

const collectionPath = path.join(__dirname, '../collection.json');
const runner = new SchematicTestRunner('schematics', collectionPath);
const whiteLabel = [true, false];

let appTree: UnitTestTree;

describe('ng-material-theme', () => {
  beforeEach(async () => {
    appTree = await runner
      .runExternalSchematicAsync('@schematics/angular', 'workspace', {
        name: 'test',
        version: '10.0.5',
      })
      .toPromise();

    appTree = await runner
      .runExternalSchematicAsync(
        '@schematics/angular',
        'application',
        { name: 'my-app', style: 'scss' },
        appTree
      )
      .toPromise();
  });

  it('should add the @angular/material and @angular/cdk schematic', async () => {
    const tree = await runner
      .runSchematicAsync(
        'ng-material-theme',
        { 'white-label': whiteLabel[Math.round(Math.random())] },
        appTree
      )
      .toPromise();

    const packageFile = JSON.parse(
      tree.read('package.json')!.toString('utf-8')
    );

    expect(packageFile.dependencies['@angular/material']).toBeTruthy();
    expect(packageFile.dependencies['@angular/cdk']).toBeTruthy();
  });

  it("should update the 'styles.scss' file on 'src' folder", async () => {
    const tree = await runner
      .runSchematicAsync('ng-material-theme', { 'white-label': false }, appTree)
      .toPromise();

    const styles = tree.read('/my-app/src/styles.scss')!.toString('utf-8');

    expect(styles).toContain("@import '@angular/material/theming';");
    expect(styles).toContain("@import './custom-component-themes.scss';");
    expect(styles).toContain("@import './theme.scss';");
  });

  it('should fail if missing tree', async () => {
    await expectAsync(
      runner
        .runSchematicAsync(
          'ng-material-theme',
          { 'white-label': whiteLabel[Math.round(Math.random())] },
          Tree.empty()
        )
        .toPromise()
    ).toBeRejected();
  });

  describe('Normal application', () => {
    it('should copy the custom theme files to the project root', async () => {
      const tree = await runner
        .runSchematicAsync(
          'ng-material-theme',
          { 'white-label': false },
          appTree
        )
        .toPromise();

      const createdThemeFile = tree.read('/my-app/src/theme.scss')!.toString();
      const baseThemeFile = fs.readFileSync(
        path.resolve(__dirname, 'files', 'src', 'theme.scss'),
        { encoding: 'utf-8' }
      );

      expect(tree.files).toContain('/my-app/src/theme.scss');
      expect(createdThemeFile).toEqual(baseThemeFile);
      expect(tree.files).toContain('/my-app/src/custom-component-themes.scss');
    });
  });

  describe('White Label application', () => {
    it('should copy the custom theme files to the project root', async () => {
      const tree = await runner
        .runSchematicAsync(
          'ng-material-theme',
          { 'white-label': true },
          appTree
        )
        .toPromise();

      const createdThemeFile = tree.read('/my-app/src/theme.scss')!.toString();
      const baseThemeFile = fs.readFileSync(
        path.resolve(__dirname, 'files-white-label', 'src', 'theme.scss'),
        { encoding: 'utf-8' }
      );

      expect(tree.files).toContain('/my-app/src/theme.scss');
      expect(createdThemeFile).toEqual(baseThemeFile);
      expect(tree.files).toContain('/my-app/src/custom-component-themes.scss');
    });
  });
});
