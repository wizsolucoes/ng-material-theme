import {
  Rule,
  SchematicContext,
  SchematicsException,
  Tree,
  chain,
  url,
  apply,
  move,
  forEach,
  mergeWith,
  MergeStrategy,
} from '@angular-devkit/schematics';
import { createDefaultPath } from '@schematics/angular/utility/workspace';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import {
  NodeDependency,
  NodeDependencyType,
  addPackageJsonDependency
} from '@schematics/angular/utility/dependencies';

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function ngMaterialTheme(_options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    return chain([
      checkValidProject(),
      addAngularMaterial(),
      generateProjectFiles(),
      updateStylesFile(),
    ])(tree, _context);
  };
}

function checkValidProject() {
  return (tree: Tree, _context: SchematicContext) => {
    const packageFile = tree.read('package.json');
    const angularFile = tree.read('angular.json');

    if (!packageFile || !angularFile)
      throw new SchematicsException('Not a valid workspace');

    return tree;
  }
}

function addAngularMaterial(): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const angularMaterial: NodeDependency = {
      name: '@angular/material',
      type: NodeDependencyType.Default,
      version: '^10.2.7',
    }

    const angularCDK: NodeDependency = {
      name: '@angular/cdk',
      type: NodeDependencyType.Default,
      version: '^10.2.7',
    }

    addPackageJsonDependency(tree, angularMaterial);
    addPackageJsonDependency(tree, angularCDK);

    _context.addTask(new NodePackageInstallTask());
  }
}

function generateProjectFiles(): Rule {
  return async (tree: Tree, _context: SchematicContext) => {
    const workspaceConfigBuffer = tree.read('angular.json');

    const workspaceConfig = JSON.parse(workspaceConfigBuffer!.toString());
    const projectName: string = workspaceConfig.defaultProject;

    const defaultProjectPath = await createDefaultPath(tree, projectName);
    const projectPath = defaultProjectPath.replace('src/app', '');

    const sourceTemplates = url('./files');

    const sourceParametrizedTemplates = apply(sourceTemplates, [
      move(projectPath),
      _overwriteIfExists(tree),
    ]);

    return mergeWith(sourceParametrizedTemplates, MergeStrategy.Overwrite);
  }
}

function updateStylesFile() {
  return (tree: Tree, _context: SchematicContext) => {
    const filePath = './src/styles.scss';
    const styles = tree.read(filePath)!.toString();

    const updatedStyles = styles.concat(`
// Custom Theming for Angular Material
// For more information: https://material.angular.io/guide/theming
@import '~@angular/material/theming';

// Plus imports for other components in your app.
@import './custom-component-themes.scss';
@import './theme.scss';\n`
    );

    tree.overwrite(filePath, updatedStyles);

    return tree;
  }
}

function _overwriteIfExists(host: Tree): Rule {
  return forEach((fileEntry) => {
    if (host.exists(fileEntry.path)) {
      host.overwrite(fileEntry.path, fileEntry.content);
      return null;
    }
    return fileEntry;
  });
}
